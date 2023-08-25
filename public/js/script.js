const socket = io(); // Create Socket.IO instance
    
        const tICKETid = document.getElementById('tICKETid');
        const chatMessages = document.getElementById('chatMessages');
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
    
        let currentRoom = '';
    
        const connectToRoom = (room) => {
            if (currentRoom) {
                socket.emit('leave', currentRoom);
            }
            currentRoom = room;
            socket.emit('join', room);
            console.log(`Connected to room ${room}`);
        };
    
        const sendMessage = () => {
            const message = messageInput.value;
            if (message.trim() !== '') {
                socket.emit('message', { room: currentRoom, message });
                messageInput.value = '';
            }
        };
    
        tICKETid.addEventListener('change', (event) => {
            const selectedRoom = event.target.value;
            if (selectedRoom !== "") {
                connectToRoom(selectedRoom);
            }
        });
    
        sendButton.addEventListener('click', sendMessage);
    
        socket.on('connect', () => {
            console.log('Connected to Socket.IO');
        });
    
        socket.on('disconnect', () => {
            console.log('Disconnected from Socket.IO');
        });
    
        socket.on('message', ({ room, message }) => {
            if (room === currentRoom) {
                const messageElement = document.createElement('div');
                messageElement.textContent = message;
                chatMessages.appendChild(messageElement);
            }
        });