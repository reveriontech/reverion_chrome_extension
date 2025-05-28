// Background service worker for the Chrome extension
chrome.runtime.onInstalled.addListener(function() {
    console.log('Python-powered Chrome extension installed');
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'processWithPython') {
        // Forward request to Python server
        fetch('http://localhost:8000/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request.data)
        })
        .then(response => response.json())
        .then(data => sendResponse(data))
        .catch(error => sendResponse({error: error.message}));
        
        return true; // Keep message channel open for async response
    }
});

// Context menu integration (optional)
chrome.contextMenus.create({
    id: "pythonProcess",
    title: "Process with Python",
    contexts: ["selection"]
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "pythonProcess") {
        // Send selected text to Python server
        const selectedText = info.selectionText;
        
        fetch('http://localhost:8000/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: selectedText })
        })
        .then(response => response.json())
        .then(data => {
            // Show notification with result
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icon48.png',
                title: 'Python Processing Complete',
                message: data.result || 'Processing completed'
            });
        })
        .catch(error => {
            console.error('Error processing with Python:', error);
        });
    }
});