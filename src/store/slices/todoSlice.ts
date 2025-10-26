import { createSlice, type PayloadAction, nanoid } from "@reduxjs/toolkit";

interface ToDo {
  id: string;
  text: string;
  isCompleted: boolean;
}

const loadFromLocalStorage = (): ToDo[] => {
  try {
    const data = localStorage.getItem("toDoList");
    return data ? (JSON.parse(data) as ToDo[]) : [];
  } catch {
    return [];
  }
};

const saveToLocalStorage = (state: ToDo[]) => {
  try {
    localStorage.setItem("toDoList", JSON.stringify(state));
  } catch {}
};

const sortToDoList = (toDoList: ToDo[]) => toDoList.sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted));

const initialState: ToDo[] = sortToDoList(loadFromLocalStorage());

const todoSlice = createSlice({
  name: "todo",
  initialState,
  reducers: {
    addToDo: (state, action: PayloadAction<string>) => {
      state.push({
        id: nanoid(),
        text: action.payload,
        isCompleted: false,
      });
      sortToDoList(state);
      saveToLocalStorage(state);
    },
    toggleToDo: (state, action: PayloadAction<string>) => {
      const toDo = state.find((toDo) => toDo.id === action.payload);
      if (toDo) {
        toDo.isCompleted = !toDo.isCompleted;
      }
      sortToDoList(state);
      saveToLocalStorage(state);
    },
    editToDo: (state, action: PayloadAction<{ id: string; text: string }>) => {
      const toDo = state.find((toDo) => toDo.id === action.payload.id);
      if (toDo) {
        toDo.text = action.payload.text;
      }
      sortToDoList(state);
      saveToLocalStorage(state);
    },
    deleteToDo: (state, action: PayloadAction<string>) => {
      const index = state.findIndex((toDo) => toDo.id === action.payload);
      if (index !== -1) {
        state.splice(index, 1);
      }
      sortToDoList(state);
      saveToLocalStorage(state);
    },
  },
});

export const { addToDo, toggleToDo, editToDo, deleteToDo } = todoSlice.actions;

export default todoSlice.reducer;
