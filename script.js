document.addEventListener('DOMContentLoaded', function () {
    const chatWidget = document.querySelector('.chat-widget');
    const chatHeader = document.querySelector('.chat-header');
    const chatContent = document.querySelector('.chat-content');

    chatHeader.addEventListener('click', function () {
        chatWidget.classList.toggle('expanded');
        chatContent.classList.toggle('expanded');
    });
});
