import create from 'zustand';

export const useStore = create(set => ({
  nodes: [],
  links: [],
  lenses: [
    { id: 'empathy', name: 'Empathy' },
    { id: 'systems', name: 'Systems' }
  ],
  domains: [
    { id: 'private', name: 'Private' },
    { id: 'public', name: 'Public' },
    { id: 'abstract', name: 'Abstract' }
  ],
  activeLensIds: [],
  mode: 'capture',
  setNodes: nodes => set({ nodes }),
  setLinks: links => set({ links }),
  toggleLens: id => set(state => {
    const exists = state.activeLensIds.includes(id);
    return { activeLensIds: exists ? state.activeLensIds.filter(x=>x!==id) : [...state.activeLensIds, id] };
  })
}));
