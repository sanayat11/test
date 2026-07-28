const STORAGE_KEY = 'crmLeads';
const STAGES = ['Новый лид', 'Квалифицирован', 'Назначена консультация', 'Отказ'];

// DOM Elements
const form = document.getElementById('leadForm');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const sourceSelect = document.getElementById('source');
const responsibleSelect = document.getElementById('responsible');
const stageSelect = document.getElementById('stage');
const specCheckbox = document.getElementById('specificationRequested');
const messageArea = document.getElementById('messageArea');
const leadsContainer = document.getElementById('leadsContainer');
const emptyMessage = document.getElementById('emptyMessage');
const leadsCount = document.getElementById('leadsCount');

let leads = [];

// Initialize app
function init() {
    loadLeads();
    renderLeads();
    setupCustomSelects();
    form.addEventListener('submit', handleFormSubmit);
}

// Load from localStorage
function loadLeads() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        leads = data ? JSON.parse(data) : [];
        if (!Array.isArray(leads)) leads = [];
    } catch (e) {
        console.error('Ошибка при чтении localStorage:', e);
        leads = [];
    }
}

// Save to localStorage
function saveLeads() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    } catch (e) {
        console.error('Ошибка при записи в localStorage:', e);
    }
}

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!validateForm(name, phone)) {
        return;
    }

    createLead(name, phone);
}

// Validate inputs
function validateForm(name, phone) {
    nameInput.classList.remove('error-input');
    phoneInput.classList.remove('error-input');
    
    if (!name && !phone) {
        showMessage('Заполните имя и номер телефона', 'error');
        nameInput.classList.add('error-input');
        phoneInput.classList.add('error-input');
        nameInput.focus();
        return false;
    }
    if (!name) {
        showMessage('Введите имя клиента', 'error');
        nameInput.classList.add('error-input');
        nameInput.focus();
        return false;
    }
    if (!phone) {
        showMessage('Введите номер телефона', 'error');
        phoneInput.classList.add('error-input');
        phoneInput.focus();
        return false;
    }

    return true;
}

// Show message
function showMessage(text, type) {
    messageArea.textContent = text;
    messageArea.className = `message ${type === 'error' ? 'error-msg' : 'success-msg'}`;
    
    // Auto hide success message
    if (type === 'success') {
        setTimeout(() => {
            messageArea.className = 'message hidden';
        }, 3000);
    }
}

// Create new lead
function createLead(name, phone) {
    const newLead = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        name: name,
        phone: phone,
        source: sourceSelect.value,
        responsible: responsibleSelect.value,
        stage: stageSelect.value,
        specificationRequested: specCheckbox.checked,
        createdAt: new Date().toLocaleString()
    };

    leads.push(newLead);
    saveLeads();
    renderLeads();
    showMessage('Лид успешно сохранен!', 'success');
    resetForm();
}

// Reset form
function resetForm() {
    nameInput.value = '';
    phoneInput.value = '';
    nameInput.classList.remove('error-input');
    phoneInput.classList.remove('error-input');
    
    sourceSelect.value = 'Холодный';
    responsibleSelect.value = 'Лидоруб';
    stageSelect.value = 'Новый лид';
    specCheckbox.checked = false;
    
    updateCustomSelect(sourceSelect);
    updateCustomSelect(responsibleSelect);
    updateCustomSelect(stageSelect);
    
    nameInput.focus();
}

// Render leads
function renderLeads() {
    leadsContainer.innerHTML = '';
    
    leadsCount.textContent = `(${leads.length})`;

    if (leads.length === 0) {
        emptyMessage.classList.remove('hidden');
        return;
    }

    emptyMessage.classList.add('hidden');

    leads.forEach(lead => {
        const card = document.createElement('div');
        card.className = 'lead-card';
        card.dataset.id = lead.id;

        const header = document.createElement('div');
        header.className = 'lead-header';
        
        const nameEl = document.createElement('div');
        nameEl.className = 'lead-name';
        nameEl.textContent = lead.name;
        
        const dateEl = document.createElement('div');
        dateEl.className = 'lead-date';
        dateEl.textContent = lead.createdAt;
        
        header.appendChild(nameEl);
        header.appendChild(dateEl);

        const details = document.createElement('div');
        details.className = 'lead-details';
        
        const pPhone = document.createElement('p');
        pPhone.innerHTML = `<strong>Телефон:</strong> `;
        const sPhone = document.createElement('span');
        sPhone.textContent = lead.phone;
        pPhone.appendChild(sPhone);
        details.appendChild(pPhone);

        const pSource = document.createElement('p');
        pSource.innerHTML = `<strong>Источник:</strong> `;
        const sSource = document.createElement('span');
        sSource.textContent = lead.source;
        pSource.appendChild(sSource);
        details.appendChild(pSource);

        const pResp = document.createElement('p');
        pResp.innerHTML = `<strong>Ответственный:</strong> `;
        const sResp = document.createElement('span');
        sResp.textContent = lead.responsible;
        pResp.appendChild(sResp);
        details.appendChild(pResp);

        const pStage = document.createElement('p');
        pStage.innerHTML = `<strong>Этап сделки:</strong> <span class="stage-value"></span>`;
        pStage.querySelector('.stage-value').textContent = lead.stage;
        details.appendChild(pStage);

        const pSpec = document.createElement('p');
        pSpec.innerHTML = `<strong>Запрошено ТЗ:</strong> `;
        const sSpec = document.createElement('span');
        sSpec.textContent = lead.specificationRequested ? 'Да' : 'Нет';
        pSpec.appendChild(sSpec);
        details.appendChild(pSpec);

        const actions = document.createElement('div');
        actions.className = 'lead-actions';

        const btnStage = document.createElement('button');
        btnStage.className = 'btn-stage';
        btnStage.textContent = 'Изменить этап';
        btnStage.onclick = () => changeLeadStage(lead.id);

        const btnDelete = document.createElement('button');
        btnDelete.className = 'btn-delete';
        btnDelete.textContent = 'Удалить';
        btnDelete.onclick = () => deleteLead(lead.id);

        actions.appendChild(btnStage);
        actions.appendChild(btnDelete);

        card.appendChild(header);
        card.appendChild(details);
        card.appendChild(actions);

        leadsContainer.appendChild(card);
    });
}

// Change stage
function changeLeadStage(id) {
    const leadIndex = leads.findIndex(l => l.id === id);
    if (leadIndex === -1) return;

    const currentStage = leads[leadIndex].stage;
    let nextIndex = STAGES.indexOf(currentStage) + 1;
    if (nextIndex >= STAGES.length) {
        nextIndex = 0;
    }

    leads[leadIndex].stage = STAGES[nextIndex];
    saveLeads();
    renderLeads();
}

// Delete lead
function deleteLead(id) {
    if (confirm('Вы уверены, что хотите удалить этого лида?')) {
        leads = leads.filter(l => l.id !== id);
        saveLeads();
        renderLeads();
    }
}

// Start app
init();

// Custom Select Logic
function setupCustomSelects() {
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-select-wrapper';
        
        const trigger = document.createElement('div');
        trigger.className = 'custom-select-trigger';
        trigger.innerHTML = `<span>${select.options[select.selectedIndex].text}</span>
                             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
        
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'custom-select-options';
        
        Array.from(select.options).forEach(option => {
            const customOption = document.createElement('div');
            customOption.className = 'custom-select-option';
            customOption.dataset.value = option.value;
            customOption.textContent = option.text;
            
            if (option.selected) {
                customOption.classList.add('selected');
            }
            
            customOption.addEventListener('click', function(e) {
                e.stopPropagation();
                select.value = this.dataset.value;
                trigger.querySelector('span').textContent = this.textContent;
                
                optionsContainer.querySelectorAll('.custom-select-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                this.classList.add('selected');
                
                wrapper.classList.remove('open');
            });
            
            optionsContainer.appendChild(customOption);
        });
        
        wrapper.appendChild(trigger);
        wrapper.appendChild(optionsContainer);
        
        select.style.display = 'none';
        select.parentNode.insertBefore(wrapper, select.nextSibling);
        
        select.customWrapper = wrapper;
        
        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            document.querySelectorAll('.custom-select-wrapper').forEach(w => {
                if (w !== wrapper) w.classList.remove('open');
            });
            wrapper.classList.toggle('open');
        });
    });
    
    document.addEventListener('click', function() {
        document.querySelectorAll('.custom-select-wrapper').forEach(w => {
            w.classList.remove('open');
        });
    });
}

function updateCustomSelect(select) {
    if (select.customWrapper) {
        const wrapper = select.customWrapper;
        const trigger = wrapper.querySelector('.custom-select-trigger span');
        const selectedOption = select.options[select.selectedIndex];
        trigger.textContent = selectedOption.text;
        
        const options = wrapper.querySelectorAll('.custom-select-option');
        options.forEach(opt => {
            opt.classList.remove('selected');
            if (opt.dataset.value === selectedOption.value) {
                opt.classList.add('selected');
            }
        });
    }
}
