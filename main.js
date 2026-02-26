// Elementos do DOM
const inputBox = document.getElementById('input-box');
const listContainer = document.getElementById('list-container');
const categorySelect = document.getElementById('category-select');
const categoriesContainer = document.getElementById('categories-container');
const tabBtns = document.querySelectorAll('.tab-btn');
const totalTasksEl = document.getElementById('total-tasks');
const completedTasksEl = document.getElementById('completed-tasks');
const pendingTasksEl = document.getElementById('pending-tasks');

// Elementos de áudio
const addSound = document.getElementById('add-sound');
const deleteSound = document.getElementById('delete-sound');
const completeSound = document.getElementById('complete-sound');

// Categorias disponíveis
const categories = ['Pessoal', 'Trabalho', 'Estudos'];
const categoryIcons = {
    'Pessoal': '👤',
    'Trabalho': '💼',
    'Estudos': '📚'
};

// Função para tocar som
function playSound(soundElement) {
    if (soundElement) {
        soundElement.currentTime = 0;
        soundElement.play().catch(() => {});
    }
}

// Função para atualizar estatísticas
function updateStats() {
    const tasks = document.querySelectorAll('#list-container .task-item');
    const total = tasks.length;
    const completed = document.querySelectorAll('#list-container .task-item.checked').length;
    const pending = total - completed;

    if (totalTasksEl) totalTasksEl.textContent = total;
    if (completedTasksEl) completedTasksEl.textContent = completed;
    if (pendingTasksEl) pendingTasksEl.textContent = pending;
}

// Função para criar elemento de tarefa
function createTaskElement(taskText, category, isChecked = false) {
    const li = document.createElement('li');
    li.className = 'task-item';
    if (isChecked) li.classList.add('checked');
    
    const taskSpan = document.createElement('span');
    taskSpan.className = 'task-text';
    taskSpan.textContent = taskText;
    
    const categoryBadge = document.createElement('span');
    categoryBadge.className = 'task-category-badge';
    categoryBadge.textContent = `${categoryIcons[category] || ''} ${category}`;
    
    const deleteBtn = document.createElement('span');
    deleteBtn.className = 'task-delete';
    deleteBtn.innerHTML = '×';
    deleteBtn.setAttribute('aria-label', 'Remover tarefa');
    
    li.appendChild(taskSpan);
    li.appendChild(categoryBadge);
    li.appendChild(deleteBtn);
    
    li.dataset.category = category;
    
    return li;
}

// Função para adicionar tarefa
function addTask() {
    const taskText = inputBox.value.trim();
    
    if (taskText === '') {
        alert('Digite uma tarefa!');
        inputBox.focus();
        return;
    }
    
    const selectedCategory = categorySelect.value;
    const taskElement = createTaskElement(taskText, selectedCategory);
    
    listContainer.appendChild(taskElement);
    playSound(addSound);
    
    inputBox.value = '';
    inputBox.focus();
    
    saveData();
    updateCategoriesView();
    updateStats();
}

// Função para remover tarefa
function removeTask(task) {
    playSound(deleteSound);
    task.remove();
    saveData();
    updateCategoriesView();
    updateStats();
}

// Função para alternar conclusão da tarefa
function toggleTaskComplete(task) {
    task.classList.toggle('checked');
    
    if (task.classList.contains('checked')) {
        playSound(completeSound);
    }
    
    saveData();
    updateCategoriesView();
    updateStats();
}

// Event listener para a lista principal (apenas um!)
listContainer.addEventListener('click', function(e) {
    const taskItem = e.target.closest('.task-item');
    if (!taskItem) return;
    
    if (e.target.classList.contains('task-delete')) {
        e.stopPropagation();
        removeTask(taskItem);
    } else {
        toggleTaskComplete(taskItem);
    }
});

// Função para salvar dados
function saveData() {
    const tasks = [];
    document.querySelectorAll('#list-container .task-item').forEach(task => {
        tasks.push({
            text: task.querySelector('.task-text').textContent,
            category: task.dataset.category,
            checked: task.classList.contains('checked')
        });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Função para carregar dados
function loadData() {
    const savedTasks = localStorage.getItem('tasks');
    if (!savedTasks) return;
    
    try {
        const tasks = JSON.parse(savedTasks);
        listContainer.innerHTML = '';
        
        tasks.forEach(task => {
            const taskElement = createTaskElement(task.text, task.category, task.checked);
            listContainer.appendChild(taskElement);
        });
        
        updateCategoriesView();
        updateStats();
    } catch (e) {
        console.error('Erro ao carregar tarefas:', e);
    }
}

// Função para atualizar visualização por categorias
function updateCategoriesView() {
    if (!categoriesContainer) return;
    
    categoriesContainer.innerHTML = '';
    const tasks = document.querySelectorAll('#list-container .task-item');
    
    if (tasks.length === 0) {
        categoriesContainer.innerHTML = '<div class="empty-message">Nenhuma tarefa adicionada</div>';
        return;
    }
    
    categories.forEach(category => {
        const categoryTasks = Array.from(tasks).filter(task => 
            task.dataset.category === category
        );
        
        if (categoryTasks.length === 0) return;
        
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category-group';
        
        // Cabeçalho da categoria
        const header = document.createElement('div');
        header.className = 'category-header';
        header.innerHTML = `
            <div class="category-title">
                <span>${categoryIcons[category]}</span>
                <span>${category}</span>
                <span class="category-count">${categoryTasks.length}</span>
            </div>
            <span class="toggle-icon">▼</span>
        `;
        
        // Container das tarefas
        const tasksContainer = document.createElement('div');
        tasksContainer.className = 'category-tasks';
        
        // Adiciona as tarefas (sem clonar, apenas referência)
        categoryTasks.forEach(task => {
            // Cria um novo elemento baseado na tarefa original
            const taskClone = createTaskElement(
                task.querySelector('.task-text').textContent,
                task.dataset.category,
                task.classList.contains('checked')
            );
            
            // Adiciona evento de clique para o clone
            taskClone.addEventListener('click', function(e) {
                e.stopPropagation();
                if (e.target.classList.contains('task-delete')) {
                    removeTask(task);
                } else {
                    toggleTaskComplete(task);
                    this.classList.toggle('checked', task.classList.contains('checked'));
                }
            });
            
            tasksContainer.appendChild(taskClone);
        });
        
        // Toggle para expandir/recolher
        header.addEventListener('click', function(e) {
            e.stopPropagation();
            tasksContainer.classList.toggle('collapsed');
            const icon = this.querySelector('.toggle-icon');
            icon.classList.toggle('expanded');
        });
        
        categoryDiv.appendChild(header);
        categoryDiv.appendChild(tasksContainer);
        categoriesContainer.appendChild(categoryDiv);
    });
}

// Função para alternar entre visualizações
function showView(view) {
    tabBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    if (view === 'all') {
        listContainer.style.display = 'block';
        categoriesContainer.style.display = 'none';
    } else {
        listContainer.style.display = 'none';
        categoriesContainer.style.display = 'block';
        updateCategoriesView();
    }
}

// Event listener para tecla Enter
inputBox.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Observer para atualizações
const observer = new MutationObserver(() => {
    if (categoriesContainer.style.display === 'block') {
        updateCategoriesView();
    }
    updateStats();
});

observer.observe(listContainer, { 
    childList: true, 
    subtree: true, 
    attributes: true,
    attributeFilter: ['class']
});

// Inicialização
loadData();
showView('all');