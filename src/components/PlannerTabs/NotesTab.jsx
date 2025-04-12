import React from 'react';

function NotesTab({ 
  noteTitle, setNoteTitle, noteText, setNoteText, noteCategory, setNoteCategory,
  tripNotes, setTripNotes, addNote
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="font-semibold mb-3">Add Notes</h3>
        
        <div className="space-y-3 bg-white border border-gray-200 p-4 rounded-lg">
          <div>
            <label className="block text-gray-700 mb-1 text-sm">Title</label>
            <input
              type="text"
              value={noteTitle}
              onChange={e => setNoteTitle(e.target.value)}
              placeholder="Restaurant, attraction, etc."
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1 text-sm">Category</label>
            <select
              value={noteCategory}
              onChange={e => setNoteCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="Restaurant">Restaurant</option>
              <option value="Attraction">Attraction</option>
              <option value="Hotel">Hotel</option>
              <option value="Activity">Activity</option>
              <option value="Shopping">Shopping</option>
              <option value="Contact">Local Contact</option>
              <option value="General">General Note</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-1 text-sm">Notes</label>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Details, address, etc."
              className="w-full p-2 border border-gray-300 rounded h-24"
            />
          </div>
          
          <button
            onClick={addNote}
            disabled={!noteTitle || !noteText}
            className={`w-full py-2 rounded ${
              !noteTitle || !noteText
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Add Note
          </button>
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold mb-3">Your Notes</h3>
        
        {tripNotes.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-gray-500">No notes added yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tripNotes.map(note => (
              <div key={note.id} className="bg-blue-50 p-3 rounded-lg relative">
                <button
                  onClick={() => setTripNotes(tripNotes.filter(n => n.id !== note.id))}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
                
                <div className="flex items-center mb-1">
                  <div className="font-medium">{note.title}</div>
                  {note.category && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {note.category}
                    </span>
                  )}
                </div>
                <div className="text-sm mt-1">{note.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotesTab;
