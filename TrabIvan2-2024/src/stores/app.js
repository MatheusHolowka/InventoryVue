import { defineStore } from 'pinia'
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';
import router from '@/router';

const auth = getAuth();
const provider = new GoogleAuthProvider();

setPersistence(auth, browserLocalPersistence);

export const useUserStore = defineStore('user', {
    state: () => ({
        user: {
            displayName: '',
            email: '',
            photoURL: '',
            accessToken: '',
        },
    }),
    actions: {
        async login() {
            const result = await signInWithPopup(auth, provider);
            this.user = result.user;
            router.push('/admin/dashboard');
            console.log('usuário logado:', this.user);
        },
        async logout() {
            await signOut(auth);
            this.user = {};
            this.user.accessToken = '';
            router.push('/login');
        },
        setUser(user) {
            this.user = user;
        }
    },
    getters: {
        isLogin: (state) => !!state.user.accessToken,
        getUser: (state) => state.user,
    },
});
