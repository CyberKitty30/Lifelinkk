import React, { useEffect, useState } from 'react';
import { getAnalyticsQueries, executeCustomSql } from '../services/api';
import { SqlQueryResult } from '../types';
import { Database, Play, Terminal, Clock, Code2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export const SQLAnalyticsPage: React.FC = () => {
  const [queries, setQueries] = useState<SqlQueryResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQueryId, setActiveQueryId] = useState<number | null>(1);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Custom SQL Sandbox State
  const [customSql, setCustomSql] = useState<string>(
    `SELECT d.full_name, d.blood_group, COUNT(dn.donation_id) AS total_donations\nFROM DONOR d\nJOIN DONATION dn ON d.donor_id = dn.donor_id\nGROUP BY d.full_name, d.blood_group\nHAVING COUNT(dn.donation_id) >= 1\nORDER BY total_donations DESC;`
  );
  const [sandboxResult, setSandboxResult] = useState<any>(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxError, setSandboxError] = useState('');

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const data = await getAnalyticsQueries();
      setQueries(data);
    } catch (err) {
      console.error('Failed to load SQL queries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunCustomQuery = async () => {
    if (!customSql.trim()) return;
    try {
      setSandboxLoading(true);
      setSandboxError('');
      setSandboxResult(null);
      const res = await executeCustomSql(customSql);
      setSandboxResult(res);
    } catch (err: any) {
      setSandboxError(err.response?.data?.message || err.message || 'Error executing SQL query');
    } finally {
      setSandboxLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(queries.map((q) => q.category)))];

  const filteredQueries = filterCategory === 'All'
    ? queries
    : queries.filter((q) => q.category === filterCategory);

  const selectedQuery = queries.find((q) => q.id === activeQueryId) || queries[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner explaining SQL concepts */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white shadow-xl border border-slate-700/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-red-400 font-bold text-xs uppercase tracking-widest mb-1">
              <Sparkles className="w-4 h-4" />
              <span>DBMS & Relational SQL Demonstration</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">PostgreSQL SQL Analytics Engine</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Demonstrating 15 relational database queries including JOINs, subqueries, HAVING clauses, unnesting, aggregate functions, date math, and custom SQL sandbox execution.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <Database className="w-6 h-6 text-red-400" />
            <div className="text-xs">
              <span className="text-slate-400 font-semibold block">Demonstrated SQL</span>
              <span className="text-white font-extrabold font-mono">15 Core Queries</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Query Catalog Sidebar & Detail Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Query Selector List */}
        <div className="lg:col-span-5 space-y-4">
          {/* Category Filter */}
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-600">Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-red-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Queries Catalog Buttons */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                Loading SQL analytics catalog...
              </div>
            ) : (
              filteredQueries.map((q) => {
                const isSelected = q.id === activeQueryId;
                return (
                  <button
                    key={q.id}
                    onClick={() => setActiveQueryId(q.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-red-500/50'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isSelected ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {q.category}
                      </span>
                      <span className={`text-[10px] font-mono ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                        {q.execution_time_ms} ms
                      </span>
                    </div>

                    <h4 className="font-bold text-xs mt-2 line-clamp-1">{q.title}</h4>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {q.sqlConcepts.slice(0, 3).map((concept) => (
                        <span
                          key={concept}
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-slate-800 text-red-300' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Query Detail View & Result Table */}
        <div className="lg:col-span-7 space-y-6">
          {selectedQuery && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6">
              {/* Query Header */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 bg-red-100 text-red-800 rounded-md border border-red-200">
                    Query #{selectedQuery.id}
                  </span>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Executed in {selectedQuery.execution_time_ms} ms</span>
                  </div>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 mt-2">{selectedQuery.title}</h3>
                <p className="text-xs text-slate-600 mt-1">{selectedQuery.description}</p>
              </div>

              {/* Concepts Tags */}
              <div className="flex flex-wrap gap-1.5">
                {selectedQuery.sqlConcepts.map((c) => (
                  <span key={c} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[11px] font-bold text-slate-700">
                    {c}
                  </span>
                ))}
              </div>

              {/* Syntax-Highlighted Formatted SQL Code Box */}
              <div>
                <div className="flex items-center justify-between bg-slate-900 text-slate-400 px-4 py-2 rounded-t-xl text-xs font-mono border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Code2 className="w-4 h-4 text-red-400" />
                    <span className="text-slate-200 font-bold">SQL Query Statement</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">PostgreSQL Syntax</span>
                </div>
                <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-b-xl overflow-x-auto leading-relaxed border border-slate-900">
                  {selectedQuery.sql}
                </pre>
              </div>

              {/* Query Live Results Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-900 text-sm">Query Execution Output</h4>
                  <span className="text-xs text-slate-500 font-semibold">
                    Rows returned: <span className="font-extrabold text-slate-900">{selectedQuery.row_count}</span>
                  </span>
                </div>

                {selectedQuery.error ? (
                  <div className="p-4 bg-red-50 text-red-700 text-xs font-mono rounded-xl border border-red-200">
                    Error: {selectedQuery.error}
                  </div>
                ) : selectedQuery.rows.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                    Query returned 0 rows matching condition.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-80 overflow-y-auto shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase sticky top-0">
                        <tr>
                          {selectedQuery.columns.map((col) => (
                            <th key={col} className="py-2.5 px-4 border-b border-slate-200 font-mono">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {selectedQuery.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            {selectedQuery.columns.map((col) => (
                              <td key={col} className="py-2.5 px-4 text-slate-800 whitespace-nowrap">
                                {row[col] !== null && row[col] !== undefined ? String(row[col]) : 'NULL'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive SQL Query Sandbox */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="p-2.5 bg-slate-900 text-white rounded-xl">
            <Terminal className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Interactive SQL Sandbox</h3>
            <p className="text-xs text-slate-500">
              Type custom PostgreSQL SELECT queries directly against the database to evaluate relational tables and schema.
            </p>
          </div>
        </div>

        <div>
          <textarea
            rows={4}
            value={customSql}
            onChange={(e) => setCustomSql(e.target.value)}
            placeholder="SELECT * FROM DONOR WHERE blood_group = 'O+';"
            className="w-full p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">
            * Read-only mode enforced for security (SELECT / WITH queries only).
          </span>
          <button
            onClick={handleRunCustomQuery}
            disabled={sandboxLoading || !customSql.trim()}
            className="px-5 py-2.5 bg-slate-900 hover:bg-red-600 text-white font-bold rounded-xl text-xs shadow-sm flex items-center space-x-2 transition-colors disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{sandboxLoading ? 'Executing SQL...' : 'Run Custom SQL Query'}</span>
          </button>
        </div>

        {sandboxError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 font-mono text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{sandboxError}</span>
          </div>
        )}

        {sandboxResult && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-bold text-slate-900">Execution Output</span>
              <span className="font-mono text-slate-500">
                {sandboxResult.execution_time_ms} ms • {sandboxResult.row_count} rows returned
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase sticky top-0">
                  <tr>
                    {sandboxResult.columns?.map((col: string) => (
                      <th key={col} className="py-2.5 px-4 border-b border-slate-200">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sandboxResult.rows?.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      {sandboxResult.columns?.map((col: string) => (
                        <td key={col} className="py-2 px-4 whitespace-nowrap text-slate-800">
                          {row[col] !== null && row[col] !== undefined ? String(row[col]) : 'NULL'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
