import { createStore } from 'vuex';

export default createStore({
  state: {
    isModalOpen: false,
  },
  mutations: {
    SET_MODAL_STATE(state, isOpen) {
      state.isModalOpen = isOpen;
    },
  },
  actions: {
    toggleModal({ commit }, isOpen) {
      commit('SET_MODAL_STATE', isOpen);
    },
  },
  getters: {
    isModalOpen: state => state.isModalOpen,
  },
});