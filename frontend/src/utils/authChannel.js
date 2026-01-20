// Modern browsers

export const authChannel = 
    'BroadcastChannel' in window
    ? new BroadcastChannel('auth')
    : null;