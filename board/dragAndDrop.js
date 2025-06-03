function allowDrop(event) {
    event.preventDefault();
    
    const dropzone = event.currentTarget;
    const dimensions = JSON.parse(sessionStorage.getItem('draggedElementDimensions') || '{}');
    
    // Remove all existing placeholders
    removePlaceholders();
    
    // Create new placeholder if dimensions are available
    if (dimensions.width && dimensions.height) {
        const placeholder = createPlaceholder(dimensions);
        dropzone.appendChild(placeholder);
    }
}

function startDragging(event, taskId) {
    const draggedElement = event.target.closest('.task_card');
    event.dataTransfer.setData('text/plain', taskId);
    
    // Für visuelle Effekte während des Ziehens
    draggedElement.classList.add('dragging');
    
    // Speichere Dimensionen als Session-Daten
    const dimensions = {
        width: draggedElement.offsetWidth,
        height: draggedElement.offsetHeight
    };
    
    sessionStorage.setItem('draggedElementDimensions', JSON.stringify(dimensions));
    
    try {
        event.dataTransfer.setData('application/json', JSON.stringify(dimensions));
    } catch (e) {
        console.log('Browser unterstützt keine komplexen Datentypen in dataTransfer');
    }
};

function handleDrop(event) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('text/plain');
    const dropzone = event.currentTarget;
    
    // Entferne visuellen Effekt vom Element
    document.querySelectorAll('.task_card.dragging').forEach(element => {
        element.classList.remove('dragging');
    });
    
    // Entferne alle Platzhalter
    removePlaceholders();
    
    // Lösche Session-Daten
    sessionStorage.removeItem('draggedElementDimensions');
    
    let targetStatus;
    if (dropzone.id === 'drag_area_todo') targetStatus = 'todo';
    else if (dropzone.id === 'drag_area_in_progress') targetStatus = 'inProgress';
    else if (dropzone.id === 'drag_area_await_feedback') targetStatus = 'awaitFeedback';
    else if (dropzone.id === 'drag_area_done') targetStatus = 'done';
    
    if (taskId && targetStatus) {
        moveTo(taskId, targetStatus);
    }
};

async function moveTo(taskId, targetStatus) {
    // Task-ID als String vergleichen!
    const taskIndex = allTasks.findIndex(task => String(task.id) === String(taskId));
    if (taskIndex === -1) return;

    allTasks[taskIndex].status = targetStatus;
    await updateTaskStatus(taskId, targetStatus);
    renderColumns();
}

async function updateTaskStatus(taskId, status) {
    try {
        // Aktualisiere nur das status-Feld in Firebase
        await fetch(`${BASE_URL}addTask/${taskId}.json`, {
            method: 'PATCH',
            body: JSON.stringify({ status: status }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error updating task status:', error);
    }
}

// Stellen Sie sicher, dass alle Bereiche die ondragover und ondrop Attribute haben
function setupDragAreas() {
    // Drop-Zonen per ID holen (nicht als Variable voraussetzen)
    const dragAreas = [
        document.getElementById('drag_area_todo'),
        document.getElementById('drag_area_in_progress'),
        document.getElementById('drag_area_await_feedback'),
        document.getElementById('drag_area_done')
    ].filter(Boolean);

    dragAreas.forEach(area => {
        area.ondragover = allowDrop;
        area.ondrop = handleDrop;
    });

    document.addEventListener('dragend', handleDragEnd);
}

// Diese Funktion sollte in board.js aufgerufen werden
// async function init() {
//     renderSidebar();
//     renderContent();
//     updateUserProfile();
//     await loadContactData();
//     await loadAddTask();
//     renderColumns();
//     loadContactsToAssigned();
//     
//     setupDragAreas(); // Already initializing drag areas here
// }

function createPlaceholder(dimensions) {
    const placeholder = document.createElement('div');
    placeholder.className = 'drag_area_placeholder';
    placeholder.style.width = `${dimensions.width}px`;
    placeholder.style.height = `${dimensions.height}px`;
    return placeholder;
}

function removePlaceholders() {
    document.querySelectorAll('.drag_area_placeholder').forEach(placeholder => {
        placeholder.remove();
    });
}

function handleDragEnd(event) {
    // Entferne visuellen Effekt vom Element
    document.querySelectorAll('.task_card.dragging').forEach(element => {
        element.classList.remove('dragging');
    });
    
    // Entferne alle Platzhalter
    removePlaceholders();
    
    // Lösche Session-Daten
    sessionStorage.removeItem('draggedElementDimensions');
}

