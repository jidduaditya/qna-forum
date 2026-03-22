'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import HeroAskSection from './HeroAskSection';
import SearchBar from './SearchBar';
import TopQuestions from './TopQuestions';
import RecentQuestions from './RecentQuestions';
import EmptyState from './EmptyState';
import NameGate from './NameGate';
import toast from 'react-hot-toast';
import {
  fetchTopQuestions,
  fetchRecentQuestions,
  fetchComments,
  postQuestion,
  upvoteQuestion,
  addComment,
  searchQuestions,
} from '@/src/api/forum';

const NAME_KEY = 'qna_user_name';

export default function App() {
  const [userName, setUserName] = useState(null); // null = not yet resolved
  const [topQuestions, setTopQuestions] = useState([]);
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [votedIds, setVotedIds] = useState(new Set());
  const [commentsMap, setCommentsMap] = useState({});

  // Read persisted name on mount (client-only)
  useEffect(() => {
    const saved = localStorage.getItem(NAME_KEY);
    setUserName(saved || ''); // '' = show gate, string = already named
  }, []);

  const handleEnter = (name) => {
    localStorage.setItem(NAME_KEY, name);
    setUserName(name);
  };

  const loadData = useCallback(async () => {
    try {
      const [top, recent] = await Promise.all([fetchTopQuestions(), fetchRecentQuestions()]);
      setTopQuestions(top);
      setRecentQuestions(recent);
    } catch (err) {
      console.error('Failed to load questions:', err);
      toast.error('Could not load questions — check your Supabase connection.');
    }
  }, []);

  useEffect(() => {
    if (userName) loadData();
  }, [userName, loadData]);

  function withComments(questions) {
    return questions.map((q) => ({
      ...q,
      comments: commentsMap[q.id] ?? [],
      comment_count: commentsMap[q.id]?.length ?? q.comment_count ?? 0,
    }));
  }

  const handlePost = async (data) => {
    try {
      await postQuestion(data);
      await loadData();
    } catch (err) {
      console.error('Failed to post question:', err);
      toast.error('Failed to post question — please try again.');
      throw err; // re-throw so HeroAskSection resets its submit state
    }
  };

  const handleSearch = async (keyword) => {
    setSearchQuery(keyword);
    if (!keyword) { setSearchResults(null); return; }
    try {
      const results = await searchQuestions(keyword);
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
      toast.error('Search failed — please try again.');
    }
  };

  const handleUpvote = async (id) => {
    const { newCount, voted } = await upvoteQuestion(id);
    setVotedIds((prev) => {
      const next = new Set(prev);
      if (voted) next.add(id); else next.delete(id);
      return next;
    });
    const patch = (qs) => qs.map((q) => (q.id === id ? { ...q, upvotes: newCount } : q));
    setTopQuestions((prev) => patch(prev));
    setRecentQuestions((prev) => patch(prev));
    if (searchResults) setSearchResults((prev) => patch(prev));
  };

  const handleFetchComments = useCallback(async (questionId) => {
    if (commentsMap[questionId]) return;
    const comments = await fetchComments(questionId);
    setCommentsMap((prev) => ({ ...prev, [questionId]: comments }));
  }, [commentsMap]);

  const handleAddComment = async (questionId, text) => {
    const comment = await addComment(questionId, text, userName || 'Anonymous');
    setCommentsMap((prev) => ({
      ...prev,
      [questionId]: [comment, ...(prev[questionId] || [])],
    }));
    const patch = (qs) =>
      qs.map((q) => q.id === questionId ? { ...q, comment_count: (q.comment_count || 0) + 1 } : q);
    setTopQuestions((prev) => patch(prev));
    setRecentQuestions((prev) => patch(prev));
  };

  // Still reading localStorage — render nothing to avoid flash
  if (userName === null) return null;

  const hasQuestions = topQuestions.length > 0 || recentQuestions.length > 0;
  const showSearch = searchResults !== null;

  const sharedProps = {
    onUpvote: handleUpvote,
    onAddComment: handleAddComment,
    onFetchComments: handleFetchComments,
    votedIds,
    userName,
  };

  return (
    <>
      {/* Name gate — blocks the forum until a name is entered */}
      {!userName && <NameGate onEnter={handleEnter} />}

      <div className={`min-h-screen bg-background transition-[filter] duration-300 ${!userName ? 'blur-sm pointer-events-none select-none' : ''}`}>
        <Header userName={userName} />
        <HeroAskSection onPost={handlePost} />
        <SearchBar onSearch={handleSearch} activeQuery={searchQuery} />

        {!hasQuestions && !showSearch && <EmptyState type="no-questions" />}

        {showSearch && searchResults.length === 0 && (
          <EmptyState type="no-results" keyword={searchQuery} />
        )}

        {showSearch && searchResults.length > 0 && (
          <div className="mx-auto max-w-[1200px] px-4 pb-16">
            <RecentQuestions questions={withComments(searchResults)} {...sharedProps} />
          </div>
        )}

        {!showSearch && hasQuestions && (
          <div className="mx-auto grid max-w-[1200px] gap-8 px-4 pb-16 md:grid-cols-2 lg:grid-cols-[2fr_3fr]">
            <TopQuestions questions={withComments(topQuestions)} {...sharedProps} />
            <RecentQuestions questions={withComments(recentQuestions)} {...sharedProps} />
          </div>
        )}
      </div>
    </>
  );
}
