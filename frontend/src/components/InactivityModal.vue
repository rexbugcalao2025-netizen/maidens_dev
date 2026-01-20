<script setup>
    import { useAuthStore } from '@/stores/auth';
    import { watch, onMounted, onBeforeUnmount } from 'vue';

    const auth = useAuthStore();

    const stayLoggedIn = () => {
        auth.resetInactivityTimer();
    };

    const onKeydown = (e) => {
        if (e.key === 'Escape' && auth.showInactivityWarning){
            stayLoggedIn();
        }
    }
   

    onMounted(() => {
        window.addEventListener('keydown',onKeydown);
    });

    onBeforeUnmount(() => {
        window.removeEventListener('keydown', onKeydown);
    });

    watch(
        () => auth.showInactivityWarning,
        (visible) => {
            document.body.style.overflow = visible ? 'hidden' : '';
        }
    );
    
</script>

<template>
    <teleport to="body">
        <div
            class="modal fade show"
            tabindex="-1"
            v-if="auth.showInactivityWarning && auth.isAuthenticated"
            style="display: block; background: rgba(0,0,0,.5)"
        >

            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Still There?</h5>
                    </div>

                    <div class="modal-body">
                        <p>
                            You'll be logged out in <strong>{{ auth.countdown }}</strong> seconds due to inactivity.
                        </p>
                    </div>

                    <div class="modal-footer">
                        <button class="btn btn-primary" @click="stayLoggedIn">
                            Stay Logged In
                        </button>
                    </div>

                </div>
            </div>
            
        </div>
    </teleport>
</template>