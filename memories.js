// Password protection
const correctPassword = "lavi2006";
let memories = [];

// DOM elements
const imageInput = document.getElementById('imageInput');
const uploadLabel = document.querySelector('.upload-label');

// Check authentication on page load
window.addEventListener('DOMContentLoaded', () => {
    // Always ask for password (removed session storage check)
    const enteredPassword = prompt('🔒 Enter password to view your memories:');
    
    if (enteredPassword === null || enteredPassword !== correctPassword) {
        if (enteredPassword !== null) {
            alert('❌ Incorrect password. Redirecting to home page.');
        }
        window.location.href = 'index.html';
        return;
    }
    
    alert('✅ Access granted! Welcome to your memories.');
    
    // Load existing memories first
    loadAndDisplayMemories();
    
    // Then setup upload handlers
    setTimeout(() => {
        setupUploadHandlers();
    }, 100);
});

// Setup upload handlers
function setupUploadHandlers() {
    if (!imageInput || !uploadLabel) {
        console.error('Upload elements not found');
        return;
    }
    
    // File input change event
    imageInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // Drag and drop functionality
    uploadLabel.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadLabel.classList.add('drag-over');
    });

    uploadLabel.addEventListener('dragleave', () => {
        uploadLabel.classList.remove('drag-over');
    });

    uploadLabel.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadLabel.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        handleFiles(files);
    });
}

// Handle uploaded files
function handleFiles(files) {
    const fileArray = Array.from(files);
    
    if (fileArray.length === 0) {
        return;
    }
    
    // Filter only image files
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
        alert('⚠️ Please select valid image files (JPG, PNG, GIF)');
        return;
    }
    
    let uploadedCount = 0;
    
    imageFiles.forEach(file => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const memory = {
                id: Date.now() + Math.random(),
                image: e.target.result,
                date: new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                timestamp: Date.now()
            };
            
            memories.push(memory);
            uploadedCount++;
            
            // Show success message and refresh gallery after all files are processed
            if (uploadedCount === imageFiles.length) {
                saveMemories();
                alert(`✅ ${uploadedCount} photo${uploadedCount > 1 ? 's' : ''} uploaded successfully!`);
                displayMemories(memories);
            }
        };
        
        reader.readAsDataURL(file);
    });
}

// Save memories to localStorage
function saveMemories() {
    try {
        localStorage.setItem('memories', JSON.stringify(memories));
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            alert('Storage limit reached! Please delete some photos to add new ones.');
        }
    }
}

// Load and display memories
function loadAndDisplayMemories() {
    const stored = localStorage.getItem('memories');
    memories = [];
    
    if (stored) {
        try {
            memories = JSON.parse(stored);
        } catch (e) {
            memories = [];
        }
    }
    
    displayMemories(memories);
}

// Display memories in gallery
function displayMemories(memories) {
    const gallery = document.getElementById('gallery');
    const emptyState = document.getElementById('emptyState');
    
    if (memories.length === 0) {
        emptyState.classList.remove('hidden');
        gallery.innerHTML = '';
        return;
    }
    
    emptyState.classList.add('hidden');
    
    // Sort memories by timestamp (newest first)
    const sortedMemories = [...memories].sort((a, b) => b.timestamp - a.timestamp);
    
    gallery.innerHTML = sortedMemories.map(memory => `
        <div class="memory-card" data-id="${memory.id}">
            <button class="delete-btn" onclick="deleteMemory(${memory.id})" title="Delete">
                ✕
            </button>
            <img src="${memory.image}" alt="Memory" onclick="viewFullImage('${memory.image}')">
            <div class="memory-info">
                <div class="memory-date">📅 ${memory.date}</div>
            </div>
        </div>
    `).join('');
}

// Delete memory
function deleteMemory(id) {
    if (confirm('Are you sure you want to delete this memory?')) {
        memories = memories.filter(memory => memory.id !== id);
        localStorage.setItem('memories', JSON.stringify(memories));
        loadAndDisplayMemories();
    }
}

// View full image
function viewFullImage(imageSrc) {
    // Find the memory ID from the image source
    const memory = memories.find(m => m.image === imageSrc);
    const memoryId = memory ? memory.id : null;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
    `;
    
    const img = document.createElement('img');
    img.src = imageSrc;
    img.style.cssText = `
        max-width: 90%;
        max-height: 75vh;
        object-fit: contain;
        border-radius: 10px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    `;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 15px;
        margin-top: 20px;
        flex-wrap: wrap;
        justify-content: center;
    `;
    
    const downloadBtn = document.createElement('button');
    downloadBtn.innerHTML = '⬇️ Download';
    downloadBtn.style.cssText = `
        padding: 15px 40px;
        background: linear-gradient(135deg, #9b59b6 0%, #f1c40f 100%);
        color: white;
        border: none;
        border-radius: 30px;
        font-size: 1.1em;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 5px 20px rgba(155, 89, 182, 0.4);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    `;
    
    downloadBtn.addEventListener('mouseover', () => {
        downloadBtn.style.transform = 'scale(1.05)';
        downloadBtn.style.boxShadow = '0 8px 25px rgba(155, 89, 182, 0.6)';
    });
    
    downloadBtn.addEventListener('mouseout', () => {
        downloadBtn.style.transform = 'scale(1)';
        downloadBtn.style.boxShadow = '0 5px 20px rgba(155, 89, 182, 0.4)';
    });
    
    downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Create a link element to download the image
        const link = document.createElement('a');
        link.href = imageSrc;
        link.download = `memory_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success message
        downloadBtn.innerHTML = '✅ Downloaded!';
        setTimeout(() => {
            downloadBtn.innerHTML = '⬇️ Download';
        }, 2000);
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '🗑️ Delete';
    deleteBtn.style.cssText = `
        padding: 15px 40px;
        background: linear-gradient(135deg, #ff4757 0%, #ff6348 100%);
        color: white;
        border: none;
        border-radius: 30px;
        font-size: 1.1em;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 5px 20px rgba(255, 71, 87, 0.4);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    `;
    
    deleteBtn.addEventListener('mouseover', () => {
        deleteBtn.style.transform = 'scale(1.05)';
        deleteBtn.style.boxShadow = '0 8px 25px rgba(255, 71, 87, 0.6)';
    });
    
    deleteBtn.addEventListener('mouseout', () => {
        deleteBtn.style.transform = 'scale(1)';
        deleteBtn.style.boxShadow = '0 5px 20px rgba(255, 71, 87, 0.4)';
    });
    
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        if (confirm('Are you sure you want to permanently delete this memory?')) {
            if (memoryId) {
                deleteMemory(memoryId);
                document.body.removeChild(modal);
            }
        }
    });
    
    const closeText = document.createElement('div');
    closeText.innerHTML = 'Click anywhere to close';
    closeText.style.cssText = `
        margin-top: 15px;
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.9em;
    `;
    
    buttonContainer.appendChild(downloadBtn);
    buttonContainer.appendChild(deleteBtn);
    
    modal.appendChild(img);
    modal.appendChild(buttonContainer);
    modal.appendChild(closeText);
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}
