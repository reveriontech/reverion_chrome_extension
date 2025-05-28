// Content script that runs on web pages
console.log('Python Extension content script loaded');

// Listen for messages from the extension
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'getPageText') {
        // Extract text content from the page
        const pageText = document.body.innerText;
        sendResponse({text: pageText});
    } else if (request.action === 'highlightText') {
        // Highlight specific text on the page
        highlightTextOnPage(request.text);
        sendResponse({success: true});
    }
});

function highlightTextOnPage(searchText) {
    // Simple text highlighting function
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    const textNodes = [];
    let node;
    
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }
    
    textNodes.forEach(textNode => {
        const parent = textNode.parentNode;
        if (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE') {
            return;
        }
        
        const text = textNode.textContent;
        if (text.includes(searchText)) {
            const highlightedText = text.replace(
                new RegExp(searchText, 'gi'),
                `<mark style="background-color: yellow;">$&</mark>`
            );
            
            const span = document.createElement('span');
            span.innerHTML = highlightedText;
            parent.replaceChild(span, textNode);
        }
    });
}