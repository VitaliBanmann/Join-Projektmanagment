const BASE_URL = 'https://join-455-default-rtdb.europe-west1.firebasedatabase.app/';
const mainContainer = document.getElementById('navbar_container');
const headerContainer = document.getElementById('header_container');
const overlay = document.getElementById('overlay_background_container');
const taskDetailCard = document.getElementById('task_detail_card');
const dragAreaTodo = document.getElementById('drag_area_todo');
const dragAreaInProgress = document.getElementById('drag_area_in_progress');
const dragAreaAwaitFeedback = document.getElementById('drag_area_await_feedback');
const dragAreaDone = document.getElementById('drag_area_done');
let allTasks = [];

async function init() {
    renderSidebar();
    renderContent();
    updateUserProfile();
    await loadContactData();
    await loadAddTask();
    renderColumns();
    loadContactsToAssigned();
    
    setupDragAreas(); // Already initializing drag areas here
};

/**
 * Rendert die nav und denn Header
 *
 */
function renderContent() {
    // mainContainer.innerHTML += getSidebarTemplate();
    headerContainer.innerHTML += getHeaderTemplate();
}

async function loadAddTask(path = '') {
    let response = await fetch(BASE_URL + path + '.json');
    let responseToJson = await response.json();
    const addTaskData = responseToJson.addTask;
    allTasks = Object.entries(addTaskData).map(([id, task]) => ({
        ...task,
        id,
    }));
}

function renderColumns() {
    renderAllTaskCards(allTasks, 'todo', dragAreaTodo);
    renderAllTaskCards(allTasks, 'inProgress', dragAreaInProgress);
    renderAllTaskCards(allTasks, 'awaitFeedback', dragAreaAwaitFeedback);
    renderAllTaskCards(allTasks, 'done', dragAreaDone);
}

function renderAllTaskCards(allTasks, state, id) {
    const todos = allTasks.filter((task) => task.status === state);
    id.innerHTML = '';
    if (todos.length === 0) {
        id.innerHTML = renderPlaceholder();
        return;
    }
    todos.forEach((task) => {
        id.innerHTML += getTaskCard(task);
    });
}

function startDragging(event, taskId) {
    const draggedElement = event.target.closest('.task_card');
    event.dataTransfer.setData('text/plain', taskId);
    
    // Füge eine Klasse hinzu für visuelle Effekte während des Ziehens
    draggedElement.classList.add('dragging');
    
    // Speichere Dimensionen sowohl in dataTransfer als auch in sessionStorage
    const dimensions = {
        width: draggedElement.offsetWidth,
        height: draggedElement.offsetHeight
    };
    
    try {
        // Einige Browser erlauben keine komplexen Daten in dataTransfer
        event.dataTransfer.setData('application/json', JSON.stringify(dimensions));
    } catch (e) {
        console.log('Browser unterstützt keine komplexen Datentypen in dataTransfer');
    }
    
    sessionStorage.setItem('draggedElementDimensions', JSON.stringify(dimensions));
}

function allowDrop(event) {
    event.preventDefault();
    const dropzone = event.currentTarget;
    
    // Versuche zuerst die Dimensionen aus dem dataTransfer zu bekommen,
    // falls das nicht funktioniert, nutze sessionStorage
    let dimensionsStr = event.dataTransfer.getData('dimensions');
    if (!dimensionsStr) {
        dimensionsStr = sessionStorage.getItem('draggedElementDimensions');
    }
    
    const dimensions = dimensionsStr ? JSON.parse(dimensionsStr) : {};
    
    // Remove any existing placeholders
    removePlaceholders();
    
    // Create new placeholder
    if (dimensions.width && dimensions.height) {
        const placeholder = createPlaceholder(dimensions);
        dropzone.appendChild(placeholder);
    }
}

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

function handleDrop(event) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('text/plain');
    const dropzone = event.currentTarget;
    
    // Entferne visuellen Effekt vom Element
    document.querySelectorAll('.task_card.dragging').forEach(element => {
        element.classList.remove('dragging');
    });
    
    // Remove all placeholders
    removePlaceholders();
    
    // Löschen der gespeicherten Dimensionen
    sessionStorage.removeItem('draggedElementDimensions');
    
    let targetStatus;
    if (dropzone.id === 'drag_area_todo') targetStatus = 'todo';
    else if (dropzone.id === 'drag_area_in_progress') targetStatus = 'inProgress';
    else if (dropzone.id === 'drag_area_await_feedback') targetStatus = 'awaitFeedback';
    else if (dropzone.id === 'drag_area_done') targetStatus = 'done';
    
    if (taskId && targetStatus) {
        moveTo(taskId, targetStatus);
    }
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

function setupDragAreas() {
    const dragAreas = [dragAreaTodo, dragAreaInProgress, dragAreaAwaitFeedback, dragAreaDone];
    
    dragAreas.forEach(area => {
        area.ondragover = allowDrop;
        area.ondrop = handleDrop;
    });
    
    // Fügen Sie den Event-Listener für dragend hinzu
    document.addEventListener('dragend', handleDragEnd);
}

async function moveTo(taskId, targetStatus) {
    const taskIndex = allTasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;

    // Aktualisiere den Status im lokalen Array
    allTasks[taskIndex].status = targetStatus;

    // Aktualisiere in der Datenbank
    const task = allTasks[taskIndex];
    await updateTaskStatus(taskId, targetStatus);

    // Render columns neu
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

function getTaskCard(task) {
    return `
        <div class="task_card" draggable="true" ondragstart="startDragging(event, '${task.id}')" id="task_${task.id}">
            <div class="task_card_content">
                <h3 class="task_card_title">${task.title}</h3>
                <p class="task_card_description">${task.description}</p>
                <div class="task_card_footer">
                    <span class="task_card_due_date">${task.dueDate || ''}</span>
                    <span class="task_card_priority">${task.priority || ''}</span>
                </div>
            </div>
        </div>
    `;
}

console.log('----------------Mobile SideBar Template----------------------');

function getSidebarTemplateMobile() {
    const currentPage = window.location.pathname;
    return ` 
    <div class="sidebar_container">  
   <nav class="sidebar_nav">
  <a href="../summary/summary.html" class="nav_item ${currentPage.includes('summary') ? 'active' : ''}">
    <img src="../assets/imgs/sidebarIcons/summary.svg" alt="Summary Icon">
    <span>Summary</span>
  </a>
   <a href="../board/board.html" class="nav_item ${currentPage.includes('board') ? 'active' : ''}">
    <img src="../assets/imgs/sidebarIcons/board.svg" alt="Board Icon">
    <span>Board</span>
  </a>
  <a href="../addTask/addTask.html" class="nav_item ${currentPage.includes('addTask') ? 'active' : ''}">
    <img src="../assets/imgs/sidebarIcons/addTask.svg" alt="Add Task Icon">
    <span>Add Task</span>
  </a>
 
  <a href="../contacts/contacts.html" class="nav_item ${currentPage.includes('contacts') ? 'active' : ''}">
    <img src="../assets/imgs/sidebarIcons/contacts.svg" alt="Contacts Icon">
    <span>Contacts</span>
  </a>
</nav>
</div>

  `;
}

console.log('----------------Mobile SideBar----------------------');

function renderSidebar() {
    const mainContainer = document.getElementById('navbar_container');
    const navContainer = document.getElementById('sidebar_container');
    const navbarMobileContainer = document.getElementById('navbar_mobile_container');

    function renderSidebarDesktop() {
        navbarMobileContainer.innerHTML = '';
        mainContainer.innerHTML = getSidebarTemplate();
        navContainer.style.display = 'block';
    }

    function renderSidebarMobile() {
        mainContainer.innerHTML = '';
        navbarMobileContainer.innerHTML = getSidebarTemplateMobile();
        navContainer.style.display = 'none';
    }

    function proofSize() {
        const width = window.innerWidth;
        if (width < 1050) {
            renderSidebarMobile();
        } else {
            renderSidebarDesktop();
        }
    }

    window.addEventListener('resize', proofSize);
    proofSize();
}