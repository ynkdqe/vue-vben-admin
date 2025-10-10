<script setup lang="ts">
import { ref, watch } from 'vue';

const noteContent = ref('');
const isSaved = ref(true);

// Generate a unique ID for this note instance
const noteId = `note-${Date.now()}`;

// Check if there's saved content for this note
const loadSavedContent = () => {
  const savedContent = localStorage.getItem(noteId);
  if (savedContent) {
    noteContent.value = savedContent;
  }
};

// Save note content to localStorage
const saveNote = () => {
  localStorage.setItem(noteId, noteContent.value);
  isSaved.value = true;
};

// Track changes to note content
watch(
  noteContent,
  () => {
    isSaved.value = false;
  },
  { deep: true },
);

// Load saved content on component mount
loadSavedContent();
</script>

<template>
  <div class="notes-widget">
    <div class="notes-header">
      <div class="save-status" :class="{ unsaved: !isSaved }">
        {{ isSaved ? 'Saved' : 'Unsaved changes' }}
      </div>
      <button @click="saveNote" class="save-button" :disabled="isSaved">
        Save
      </button>
    </div>

    <textarea
      v-model="noteContent"
      class="notes-textarea"
      placeholder="Type your notes here..."
    ></textarea>
  </div>
</template>

<style scoped>
.notes-widget {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.save-status {
  font-size: 0.9rem;
  color: #4caf50;
}

.save-status.unsaved {
  color: #ff9800;
}

.save-button {
  padding: 5px 10px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.save-button:hover:not(:disabled) {
  background-color: #3e8e41;
}

.save-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.notes-textarea {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
}

.notes-textarea:focus {
  outline: none;
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}
</style>
