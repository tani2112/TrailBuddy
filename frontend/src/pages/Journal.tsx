import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  MapPin,
  Calendar,
  CloudSun,
  Tag,
  Edit2,
  Trash2,
  X,
  Check,
  Shield,
  Sparkles,
  Filter,
} from 'lucide-react';
import { JournalEntry } from '../types';
import { api } from '../services/api';

interface JournalProps {
  entries: JournalEntry[];
  onRefreshEntries: () => Promise<void>;
}

const WEATHER_OPTIONS = [
  'Sunny ☀️',
  'Partly Cloudy ⛅',
  'Overcast ☁️',
  'Breezy 🍃',
  'Gentle Rain 🌧️',
  'Golden Hour 🌅',
  'Crisp Morning ❄️',
];

const CATEGORY_OPTIONS = [
  'General',
  'Bird',
  'Plant',
  'Tree',
  'Insect',
  'Ecosystem',
  'Sensory',
  'Mindfulness',
];

export const Journal: React.FC<JournalProps> = ({
  entries,
  onRefreshEntries,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [locationName, setLocationName] = useState('');
  const [weather, setWeather] = useState(WEATHER_OPTIONS[0]);
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [sensoryObservation, setSensoryObservation] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Filter entries
  const filteredEntries = entries.filter((e) => {
    if (selectedCategory !== 'All' && e.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchNotes = e.notes.toLowerCase().includes(q);
      const matchLoc = e.location_name.toLowerCase().includes(q);
      const matchSensory = e.sensory_observation.toLowerCase().includes(q);
      const matchTags = e.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchNotes && !matchLoc && !matchSensory && !matchTags) {
        return false;
      }
    }
    return true;
  });

  const openCreateModal = () => {
    setEditingEntry(null);
    setTitle('');
    setNotes('');
    setLocationName('');
    setWeather(WEATHER_OPTIONS[0]);
    setCategory(CATEGORY_OPTIONS[0]);
    setTags([]);
    setSensoryObservation('');
    setIsModalOpen(true);
  };

  const openEditModal = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setNotes(entry.notes);
    setLocationName(entry.location_name);
    setWeather(entry.weather || WEATHER_OPTIONS[0]);
    setCategory(entry.category || CATEGORY_OPTIONS[0]);
    setTags(entry.tags || []);
    setSensoryObservation(entry.sensory_observation || '');
    setIsModalOpen(true);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !notes.trim()) return;

    setIsSaving(true);
    try {
      if (editingEntry) {
        await api.updateJournalEntry(editingEntry.id, {
          title: title.trim(),
          notes: notes.trim(),
          location_name: locationName.trim(),
          weather,
          category,
          tags,
          sensory_observation: sensoryObservation.trim(),
        });
      } else {
        await api.createJournalEntry({
          title: title.trim(),
          notes: notes.trim(),
          location_name: locationName.trim(),
          weather,
          category,
          tags,
          sensory_observation: sensoryObservation.trim(),
        });
      }
      await onRefreshEntries();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(`Error saving journal entry: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, entryTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${entryTitle}"?`)) {
      try {
        await api.deleteJournalEntry(id);
        await onRefreshEntries();
      } catch (err: any) {
        alert(`Error deleting entry: ${err.message}`);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-nature-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream-200 border border-nature-200 text-nature-800 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5 text-emerald-700" />
              <span>100% Private • Stored Locally in SQLite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-nature-900 tracking-tight">
              Nature Field Journal
            </h1>
            <p className="text-xs sm:text-sm text-nature-600">
              Record your outdoor observations, bird sightings, and sensory memories.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-5 py-3 rounded-2xl bg-nature-800 hover:bg-nature-900 text-white font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Observation</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="pt-4 border-t border-nature-100 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-nature-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entries by title, notes, location, or tags..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-cream-50 border border-nature-200 text-xs text-nature-900 placeholder:text-nature-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
            {['All', ...CATEGORY_OPTIONS].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-nature-800 text-white shadow-xs'
                    : 'bg-cream-100 hover:bg-cream-200 text-nature-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Journal Entries List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEntries.map((entry) => (
          <div
            key={entry.id}
            className="bg-white rounded-3xl p-6 border border-nature-200/90 shadow-xs hover:shadow-md card-hover-glow flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              {/* Category, Weather & Date */}
              <div className="flex items-center justify-between text-xs text-nature-500">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-nature-100 text-nature-800 font-bold text-[11px] uppercase tracking-wider">
                    {entry.category}
                  </span>
                  {entry.weather && (
                    <span className="text-nature-600 font-medium">
                      {entry.weather}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-nature-400" />
                  <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Title & Notes */}
              <div>
                <h3 className="text-lg font-black text-nature-900 tracking-tight">
                  {entry.title}
                </h3>
                <p className="text-xs text-nature-700 leading-relaxed mt-2 whitespace-pre-line">
                  {entry.notes}
                </p>
              </div>

              {/* Sensory Observation Note */}
              {entry.sensory_observation && (
                <div className="p-3 rounded-2xl bg-cream-100 border border-nature-200/80 text-xs text-nature-800 flex items-start gap-2">
                  <span className="text-base flex-shrink-0">👂</span>
                  <div className="leading-relaxed">
                    <span className="font-bold block text-[11px] text-nature-900 uppercase tracking-wider">
                      Sensory Impressions:
                    </span>
                    <span className="italic">{entry.sensory_observation}</span>
                  </div>
                </div>
              )}

              {/* Location Badge (Optional User Entered) */}
              {entry.location_name && (
                <div className="flex items-center gap-1.5 text-xs text-nature-600 font-medium pt-1">
                  <MapPin className="w-3.5 h-3.5 text-nature-500" />
                  <span>{entry.location_name}</span>
                </div>
              )}

              {/* Tags */}
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {entry.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-cream-200 text-nature-700 text-[11px] font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions: Edit & Delete */}
            <div className="pt-3 border-t border-nature-100 flex items-center justify-between text-xs text-nature-500">
              <span className="text-[10px] text-nature-400">
                Local Entry ID: {entry.id.substring(0, 10)}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(entry)}
                  className="p-1.5 rounded-lg text-nature-600 hover:text-nature-900 hover:bg-cream-200 transition-colors"
                  title="Edit entry"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(entry.id, entry.title)}
                  className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                  title="Delete entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEntries.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-nature-200 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-nature-100 text-nature-700 mx-auto flex items-center justify-center text-2xl">
            📖
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-nature-900">
              No journal entries found
            </h3>
            <p className="text-xs text-nature-600 max-w-sm mx-auto">
              Your field journal is your local, private sanctuary. Capture your first outdoor observation!
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-2xl bg-nature-800 hover:bg-nature-900 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Entry</span>
          </button>
        </div>
      )}

      {/* Modal: Create / Edit Entry */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nature-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-nature-200 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-nature-400 hover:text-nature-800 hover:bg-cream-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-nature-900 mb-4">
              {editingEntry ? 'Edit Field Observation' : 'New Field Observation'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Title */}
              <div>
                <label className="font-bold text-nature-800 block mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sighting of Red-Tailed Hawk over the meadow"
                  className="w-full p-3 rounded-2xl bg-cream-50 border border-nature-200 text-sm text-nature-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Category & Weather */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-nature-800 block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-2xl bg-cream-50 border border-nature-200 text-xs text-nature-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-nature-800 block mb-1">
                    Weather / Atmosphere
                  </label>
                  <select
                    value={weather}
                    onChange={(e) => setWeather(e.target.value)}
                    className="w-full p-2.5 rounded-2xl bg-cream-50 border border-nature-200 text-xs text-nature-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {WEATHER_OPTIONS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Observation Notes */}
              <div>
                <label className="font-bold text-nature-800 block mb-1">
                  Observation Notes *
                </label>
                <textarea
                  required
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe what you observed: movement, plumage, leaf margins, sunlight, animal behavior..."
                  className="w-full p-3 rounded-2xl bg-cream-50 border border-nature-200 text-sm text-nature-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              {/* Sensory Impressions */}
              <div>
                <label className="font-bold text-nature-800 block mb-1">
                  Sensory Impressions (Sounds, Smells, Textures)
                </label>
                <input
                  type="text"
                  value={sensoryObservation}
                  onChange={(e) => setSensoryObservation(e.target.value)}
                  placeholder="e.g. Smell of fresh damp spruce, sound of distant stream"
                  className="w-full p-2.5 rounded-2xl bg-cream-50 border border-nature-200 text-xs text-nature-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Optional General Location */}
              <div>
                <label className="font-bold text-nature-800 block mb-1">
                  Location (General Name — No GPS Needed)
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Pine Ridge Trail, Backyard Garden, City Park Bench"
                  className="w-full p-2.5 rounded-2xl bg-cream-50 border border-nature-200 text-xs text-nature-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[10px] text-nature-500 mt-1 block">
                  🔒 We never request device GPS coordinates. Keep it as general as you like.
                </span>
              </div>

              {/* Tags */}
              <div>
                <label className="font-bold text-nature-800 block mb-1">
                  Tags (Press Enter or Add)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="e.g. cedar, autumn, mushrooms"
                    className="flex-1 p-2 rounded-xl bg-cream-50 border border-nature-200 text-xs text-nature-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 rounded-xl bg-cream-200 hover:bg-cream-300 font-bold text-nature-800 text-xs transition-colors"
                  >
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md bg-nature-100 text-nature-800 text-[11px] font-semibold flex items-center gap-1"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="hover:text-rose-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-nature-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-nature-600 hover:text-nature-900 font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-2xl bg-nature-800 hover:bg-nature-900 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Observation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
