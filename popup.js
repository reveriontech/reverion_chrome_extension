document.addEventListener('DOMContentLoaded', function() {
    const statusElement = document.getElementById('status');
    const resultElement = document.getElementById('result');
    const userInput = document.getElementById('userInput');
    
    // Check if Python server is running
    checkServerStatus();
    
    document.getElementById('processBtn').addEventListener('click', async function() {
        const text = userInput.value.trim();
        if (!text) {
            showResult('Please enter some text');
            return;
        }
        
        setStatus('Processing...');
        try {
            const response = await fetch('http://localhost:8000/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: text })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            showResult(`Processed: ${data.result}`);
            setStatus('Complete');
        } catch (error) {
            showResult(`Error: ${error.message}`);
            setStatus('Error - Make sure Python server is running');
        }
    });
    
    document.getElementById('analyzeBtn').addEventListener('click', async function() {
        const text = userInput.value.trim();
        if (!text) {
            showResult('Please enter some text');
            return;
        }
        
        setStatus('Analyzing...');
        try {
            const response = await fetch('http://localhost:8000/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: text })
            });
            
            const data = await response.json();
            showResult(`Analysis: ${data.word_count} words, ${data.char_count} characters, Sentiment: ${data.sentiment}`);
            setStatus('Complete');
        } catch (error) {
            showResult(`Error: ${error.message}`);
            setStatus('Error - Make sure Python server is running');
        }
    });
    
    document.getElementById('getCurrentTab').addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const currentTab = tabs[0];
            showResult(`Current tab: ${currentTab.title}\nURL: ${currentTab.url}`);
        });
    });
    
    function setStatus(message) {
        statusElement.textContent = message;
    }
    
    function showResult(message) {
        resultElement.textContent = message;
    }
    
    async function checkServerStatus() {
        try {
            const response = await fetch('http://localhost:8000/health');
            if (response.ok) {
                setStatus('Python server connected');
            } else {
                setStatus('Python server not responding');
            }
        } catch (error) {
            setStatus('Python server not running');
        }
    }
});