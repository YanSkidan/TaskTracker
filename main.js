// Функции для работы с LocalStorage
function saveAllTasks() {
    const allTasks = {};
    
    // Собираем все задачи со страницы
    document.querySelectorAll('li').forEach(li => {
        const id = li.id;
        if (id) {
            allTasks[id] = {
                text: li.textContent.replace('✓', '').trim(),
                completed: li.classList.contains('completed'),
                additionalInfo: li.dataset.additionalInfo || ''
            };
        }
    });
    
    localStorage.setItem('taskTrackerData', JSON.stringify(allTasks));
}

function loadAllTasks() {
    const savedData = localStorage.getItem('taskTrackerData');
    if (savedData) {
        const allTasks = JSON.parse(savedData);
        
        // Восстанавливаем задачи
        Object.keys(allTasks).forEach(taskId => {
            const task = allTasks[taskId];
            const li = document.getElementById(taskId);
            if (li) {
                li.textContent = task.text;
                li.dataset.additionalInfo = task.additionalInfo;
                if (task.completed) {
                    li.classList.add('completed');
                }
            }
        });
    }
}

//Для каждого LI на странице запускаем ф-цию
document.querySelectorAll('li').forEach(li => {
  li.addEventListener('click', function(event) {
    if (!event.target.closest('.hover-checkmark')) { //Если нажатие было на LI, но не на галочку
      const cleanText = this.textContent.replace('✓', '').trim(); //Получаем весь текст из LI,кроме пробелов и галочки
      showCenterDiv(cleanText, this);//передаем в ф-цию очищенный текст и ссылку на LI
    }
  });
});

//Появление окна для ввода задачи в LI
function showCenterDiv(content, liElement) {
    //Удаление старого окна(При наличии), чтобы не было дублей
    const existingModal = document.querySelector('.center-modal');
    if (existingModal) {
        existingModal.remove();
    }
    //Создание нового div-элемента и присвоение ему класса
    const modal = document.createElement('div');
    modal.className = 'center-modal';

    const additionalInfo = liElement.dataset.additionalInfo || '';
    //Содержимое окна
    modal.innerHTML = `
        <div class="modal-content">
            <h2 class="modal_h2">Введите задачу</h2>
            <input type="text" class="input_zad" placeholder="Введи задачу" value="${content}">
            <textarea class="input_zad_area" placeholder="Дополнительная информация">${additionalInfo}</textarea>
            <button class="close-btn">Сохранить</button>
        </div>
    `;
    
    // Сохраняем ссылку на li
    modal.currentLi = liElement;
    
    document.body.appendChild(modal);//добавляем модальное окно в конец body
    modal.querySelector('.input_zad').focus();//устанавливем фокус на input
    
    // Закрытие по кнопке
    modal.querySelector('.close-btn').addEventListener('click', function() {
        saveAndClose(modal);
    });
    //Закрытие по клику вне окна
    let modalMouseDownTarget = null;

    modal.addEventListener('mousedown', function(event) {
        // Запоминаем где был mousedown
        modalMouseDownTarget = event.target;
    });

    modal.addEventListener('click', function(event) {
        // Закрываем только если mousedown И mouseup были на самом modal (не на content)
        if (event.target === modal && modalMouseDownTarget === modal) {
            saveAndClose(modal);
        }
    });

    // Закрытие по Escape и Enter
    document.addEventListener('keydown', function closeOnKey(event) {
        // Проверяем, находится ли фокус в textarea
        const isInTextarea = event.target.classList.contains('input_zad_area');
        
        if (event.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', closeOnKey);
        } else if (event.key === 'Enter' && !isInTextarea) {
            // Закрываем только если Enter нажат НЕ в textarea
            saveAndClose(modal);
            document.removeEventListener('keydown', closeOnKey);
        }
    // Если Enter в textarea - ничего не делаем (браузер сам перенесет строку)
    });
}

//Сохранение данных
function saveAndClose(modal) {
    //Находим поле ввода и получаем из него текст
    const input = modal.querySelector('.input_zad');
    const newText = input.value.trim();
    const textarea = modal.querySelector('.input_zad_area');
    const additionalText = textarea.value;
    
    if (modal.currentLi) {
        if (newText) {
            // Если есть текст - обновляем
            modal.currentLi.textContent = newText;
            // Сохраняем дополнительный текст в data-атрибут
            modal.currentLi.dataset.additionalInfo = additionalText;
        } else {
            // Если текст пустой - удаляем содержимое
            modal.currentLi.textContent = '';
            modal.currentLi.dataset.additionalInfo = '';
        }
        
        // Сохраняем ВСЕ задачи в LocalStorage
        saveAllTasks();
        
        // Добавляем обработчики на обновленный элемент
        addClickHandler(modal.currentLi);
        addHoverHandlers(modal.currentLi);
    }
    
    modal.remove();
}

// Добавляем только обработчик клика
function addClickHandler(li) {
    li.addEventListener('click', function(event) {
        if (!event.target.closest('.hover-checkmark')) {
            const cleanText = this.textContent.replace('✓', '').trim();
            showCenterDiv(cleanText, this);
        }
    });
}

// Функция для добавления обработчиков hover
function addHoverHandlers(li) {
    li.addEventListener('mouseenter', function() {
        this.style.position = 'relative';
        if (!this.querySelector('.hover-checkmark')) {
            const span = document.createElement('span');
            span.className = 'hover-checkmark';
            span.textContent = '✓';
            span.style.cssText = `
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                color: black;
                font-weight: bold;
                background: white;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1.6px solid black;
            `;
            
            span.addEventListener('click', function(event) {
                event.stopPropagation();
                const liElement = this.parentElement;
                liElement.classList.toggle('completed');
                
                // Сохраняем состояние выполнения задачи
                saveAllTasks();
            });
            this.appendChild(span);
        }
    });
    
    li.addEventListener('mouseleave', function() {
        const span = this.querySelector('.hover-checkmark');
        if (span) {
            span.remove();
        }
    });
}

// Функция для очистки всех данных (опционально, для отладки)
function clearAllTasks() {
    localStorage.removeItem('taskTrackerData');
    location.reload();
}

// Инициализация для всех существующих li
document.querySelectorAll('li').forEach(li => {
    addClickHandler(li);
    addHoverHandlers(li);
});

// Загружаем сохраненные задачи при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadAllTasks();
});

// Сохраняем задачи при закрытии/обновлении страницы
window.addEventListener('beforeunload', function() {
    saveAllTasks();
});