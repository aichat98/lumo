const app = {
    timelineData: [
        { date: '1999-06', title: '첫 만남', desc: '우연히 같은 카페에서 마주치게 되면서 시작된 인연', image: null },
        { date: '2000-03', title: '갈등', desc: '서로 다른 가치관으로 인한 첫 번째 큰 갈등이 발생', image: null },
        { date: '2020-01', title: '화해', desc: '오랜 시간이 지난 후 우연히 재회하게 되면서 새로운 관계를 시작', image: null }
    ],
    stickerData: [],
    extraSections: { char1: [], char2: [] },
    isEditMode: false,
    currentColorTarget: null,
    isImagePickerOpen: false,
    outsideClickHandlerAdded: false,

    init() {
        this.updateTimelineDisplay();
        this.setupEventListeners();
        this.hideHeaderControlsOnStart();
    },

    hideHeaderControlsOnStart() {
        // 페이지 로드시 헤더 컨트롤 숨기기만
        const headerControls = document.querySelector('.header-controls');
        if (headerControls) {
            headerControls.style.display = 'none';
        }
        
        // 패딩 강제 초기화!
const pairHeader = document.querySelector('.pair-header');
if (pairHeader) {
    pairHeader.style.padding = '15px 15px 15px 15px';
    pairHeader.style.paddingTop = '15px';
    pairHeader.style.paddingBottom = '15px';
}
    },

    updateTimelineDisplay() {
        const container = document.getElementById('timeline-container');
        const existingItems = container.querySelectorAll('.timeline-item');
        existingItems.forEach(item => item.remove());

        this.timelineData.forEach((item, index) => {
            const position = this.timelineData.length === 1 ? 50 : 
                (index / (this.timelineData.length - 1)) * 100;
            
            const itemEl = document.createElement('div');
            itemEl.className = 'timeline-item';
            itemEl.style.top = `${position}%`;
            
            itemEl.innerHTML = `
                <div class="timeline-dot"></div>
                <div class="timeline-controls">
                    <button class="timeline-btn" onclick="app.addImageToTimeline(${index})">🖼️</button>
                    <button class="timeline-btn" onclick="app.deleteTimelineItem(${index})">🗑️</button>
                </div>
                <div class="timeline-date" data-index="${index}" data-type="date">${item.date}</div>
                <div class="timeline-title-text" data-index="${index}" data-type="title">${item.title}</div>
                <div class="timeline-desc" data-index="${index}" data-type="desc">${item.desc}</div>
                ${item.image ? `
                    <div class="timeline-image-container">
                        <img src="${item.image}" class="timeline-image" alt="타임라인 이미지">
                        <button class="timeline-image-delete" onclick="app.deleteTimelineImage(${index})">×</button>
                    </div>
                ` : ''}
            `;
            
            container.appendChild(itemEl);

            // 타임라인 요소들에 편집 이벤트 추가
            const timelineElements = itemEl.querySelectorAll('.timeline-date, .timeline-title-text, .timeline-desc');
            timelineElements.forEach(element => {
                if (this.isEditMode) {
                    element.contentEditable = true;
                }
                
                // 블러 이벤트로 데이터 저장
                element.addEventListener('blur', () => {
                    const index = parseInt(element.dataset.index);
                    const type = element.dataset.type;
                    const newValue = element.textContent.trim();
                    
                    if (type === 'date') this.timelineData[index].date = newValue;
                    else if (type === 'title') this.timelineData[index].title = newValue;
                    else if (type === 'desc') this.timelineData[index].desc = newValue;
                });
            });
        });
    },

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        const fairtle = document.getElementById('fairtle-card');
        const editButton = document.querySelector('.edit-button');
        const headerControls = document.querySelector('.header-controls');
        
        if (this.isEditMode) {
            fairtle.classList.add('edit-mode');
            editButton.classList.add('active');
            if (headerControls) {
                headerControls.style.display = 'flex';
                headerControls.style.justifyContent = 'center';
                headerControls.style.gap = '15px';
                headerControls.style.left = '50%';
                headerControls.style.transform = 'translateX(-50%)';
            }
            this.enableEditing();
        } else {
            fairtle.classList.remove('edit-mode');
            editButton.classList.remove('active');
            if (headerControls) headerControls.style.display = 'none';
            this.disableEditing();
            this.closeColorPicker();
        }

        // 타임라인 다시 그리기 (편집모드 반영)
        this.updateTimelineDisplay();
    },

    enableEditing() {
        const editableElements = [
            '#pair-title', '#pair-subtitle', '#char1-name', '#char2-name',
            '#char1-speech', '#char2-speech', '#char1-past', '#char2-past',
            '#char1-features', '#char2-features', '#char1-emoji', '#char2-emoji',
            '#source-credit'
        ];

        editableElements.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.contentEditable = true;
                element.classList.add('editable-text');
            }
        });

        // 출처란 내용 체크
        this.checkSourceCredit();

        const basicInfos = document.querySelectorAll('.character-basic div');
        basicInfos.forEach(info => {
            info.contentEditable = true;
            info.classList.add('editable-text');
        });

        const extraSections = document.querySelectorAll('.detail-content');
        extraSections.forEach(section => {
            section.contentEditable = true;
            section.classList.add('editable-text');
        });

        this.setupAdvancedEditing();
    },

    checkSourceCredit() {
        const sourceCredit = document.getElementById('source-credit');
        const content = sourceCredit.textContent.trim();
        
        if (content && content !== '일러스트 by 작가명') {
            sourceCredit.classList.add('has-content');
        } else {
            sourceCredit.classList.remove('has-content');
        }
    },

    setupAdvancedEditing() {
        const colorSquares = document.querySelectorAll('.color-square');
        colorSquares.forEach(square => {
            square.addEventListener('click', (e) => {
                if (!this.isEditMode) return;
                e.stopPropagation();
                this.openColorWheel(e.target);
            });
        });

        const pairColorTab = document.getElementById('pair-color-tab');
        if (pairColorTab) {
            pairColorTab.addEventListener('click', (e) => {
                if (!this.isEditMode) return;
                e.stopPropagation();
                this.openColorWheel(e.target, true);
            });
        }

        const avatarBgs = document.querySelectorAll('.avatar-bg');
        avatarBgs.forEach((avatarBg, index) => {
            avatarBg.addEventListener('click', (e) => {
                if (!this.isEditMode) return;
                e.stopPropagation();
                const charType = index === 0 ? 'char1' : 'char2';
                this.openImagePicker(charType);
            });
        });

// 페어 헤더 이미지 업로드
const pairHeader = document.querySelector('.pair-header');
if (pairHeader) {
pairHeader.addEventListener('click', (e) => {
    if (!this.isEditMode) return;
    
    // 텍스트 편집 영역 클릭시에는 이미지 업로드 안 함
    if (e.target.contentEditable === 'true' || 
        e.target.classList.contains('editable-text') ||
        e.target.closest('[contenteditable="true"]')) {
        return;
    }
    
    e.stopPropagation();
    this.openImagePicker('header');
});
}

        document.addEventListener('click', (e) => {
            if (!this.isEditMode) return;
            
            if (e.target.classList.contains('keyword-tag')) {
                this.editKeyword(e.target);
            }
            
            if (e.target.classList.contains('add-keyword-btn')) {
                e.preventDefault();
                e.stopPropagation();
                this.addNewKeyword(e.target.closest('.character-keywords'));
            }
        });

        document.addEventListener('click', (e) => {
            const colorPicker = document.querySelector('.color-picker-panel');
            if (colorPicker && !colorPicker.contains(e.target) && !e.target.classList.contains('color-square') && !e.target.classList.contains('pair-color-tab')) {
                this.closeColorPicker();
            }
        });
    },

    openColorWheel(targetElement, isPairColor = false) {
        this.closeColorPicker();
        
        const rect = targetElement.getBoundingClientRect();
        const picker = document.createElement('div');
        picker.className = 'color-picker-panel';
        
        let left = rect.left + rect.width / 2 - 125;
        let top = rect.top - 220;
        
        if (left < 10) left = 10;
        if (left > window.innerWidth - 260) left = window.innerWidth - 260;
        if (top < 10) top = rect.bottom + 10;
        
        picker.style.left = `${left}px`;
        picker.style.top = `${top}px`;
        
        picker.innerHTML = `
            <div class="color-gradient-area" onmousemove="app.previewColorFromGradient(event, this)" onclick="app.selectColorFromGradient(event, this)"></div>
            <div class="color-preview-bar">
                <div class="current-color-preview" id="current-color-preview" style="background: #ff0000;"></div>
                <div class="rgb-values" id="rgb-values">RGB: 255, 0, 0</div>
            </div>
        `;

        this.currentColorTarget = { element: targetElement, isPairColor };
        document.body.appendChild(picker);
    },

    previewColorFromGradient(event, gradientElement) {
        const rect = gradientElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const xPercent = Math.max(0, Math.min(1, x / rect.width));
        const yPercent = Math.max(0, Math.min(1, y / rect.height));
        
        const hue = xPercent * 360;
        const saturation = 1;
        const lightness = 1 - yPercent; // Y축 = 명도 (위=흰색, 아래=검정)
        
        const rgb = this.hslToRgb(hue, saturation, lightness);
        const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
        
        const preview = document.getElementById('current-color-preview');
        const rgbDisplay = document.getElementById('rgb-values');
        if (preview) preview.style.background = hex;
        if (rgbDisplay) rgbDisplay.textContent = `RGB: ${rgb.r}, ${rgb.g}, ${rgb.b}`;
    },

    selectColorFromGradient(event, gradientElement) {
        if (!this.currentColorTarget) return;
        
        const rect = gradientElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const xPercent = Math.max(0, Math.min(1, x / rect.width));
        const yPercent = Math.max(0, Math.min(1, y / rect.height));
        
        const hue = xPercent * 360;
        const saturation = 1;
        const lightness = 1 - yPercent; // Y축 = 명도
        
        const rgb = this.hslToRgb(hue, saturation, lightness);
        const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
        
        const preview = document.getElementById('current-color-preview');
        const rgbDisplay = document.getElementById('rgb-values');
        if (preview) preview.style.background = hex;
        if (rgbDisplay) rgbDisplay.textContent = `RGB: ${rgb.r}, ${rgb.g}, ${rgb.b}`;
        
        if (this.currentColorTarget.isPairColor) {
            this.updatePrimaryColor(hex);
        } else {
            this.currentColorTarget.element.style.background = hex;
        }
        
        this.closeColorPicker();
    },

    hslToRgb(h, s, l) {
        h /= 360;
        const a = s * Math.min(l, 1 - l);
        const f = n => {
            const k = (n + h * 12) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color);
        };
        return { r: f(0), g: f(8), b: f(4) };
    },

    rgbToHex(r, g, b) {
        return "#" + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }).join("");
    },

    closeColorPicker() {
        const picker = document.querySelector('.color-picker-panel');
        if (picker) {
            picker.remove();
        }
        this.currentColorTarget = null;
    },

    updatePrimaryColor(color) {
        const root = document.documentElement;
        
        // CSS 변수 업데이트
        root.style.setProperty('--primary-color', color);
        root.style.setProperty('--light-color', this.hexToRgba(color, 0.1));
        root.style.setProperty('--speech-color', this.hexToRgba(color, 0.2));
        root.style.setProperty('--emoji-border-color', this.hexToRgba(color, 0.6));
        
        // 대표색상 탭도 업데이트
        const pairColorTab = document.getElementById('pair-color-tab');
        if (pairColorTab) {
            pairColorTab.style.background = color;
        }

        // 직접 스타일 강제 적용 (CSS 변수 안 먹힐 때 대비)
        this.forceApplyColors(color);
    },

    forceApplyColors(color) {
        // 키워드 태그들
        document.querySelectorAll('.keyword-tag').forEach(tag => {
            tag.style.backgroundColor = this.hexToRgba(color, 0.1);
        });

        // 섹션 제목들
        document.querySelectorAll('.detail-title').forEach(title => {
            title.style.backgroundColor = this.hexToRgba(color, 0.1);
        });

        // 말풍선들
        document.querySelectorAll('.character-speech').forEach(speech => {
            speech.style.backgroundColor = this.hexToRgba(color, 0.2);
        });

        // 말풍선 꼬리도 업데이트
        this.updateSpeechBubbleArrows(color);

        // 타임라인 요소들
        document.querySelectorAll('.timeline-date').forEach(date => {
            date.style.backgroundColor = color;
        });

        document.querySelectorAll('.timeline-dot').forEach(dot => {
            dot.style.backgroundColor = color;
        });

        document.querySelectorAll('.timeline-line').forEach(line => {
            line.style.backgroundColor = color;
        });

        // 이모지 테두리
        document.querySelectorAll('.emoji-circle').forEach(circle => {
            circle.style.borderColor = this.hexToRgba(color, 0.6);
        });

        // 페어 헤더 보더
        const pairHeader = document.querySelector('.pair-header');
        if (pairHeader) {
            pairHeader.style.borderBottomColor = color;
        }
    },

    updateSpeechBubbleArrows(color) {
        // 동적으로 CSS 규칙 생성해서 말풍선 꼬리 색상 변경
        const styleId = 'speech-arrow-style';
        let styleEl = document.getElementById(styleId);
        
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            document.head.appendChild(styleEl);
        }

        const speechColor = this.hexToRgba(color, 0.2);
        styleEl.textContent = `
            .character-speech.left::after {
                border-right-color: ${speechColor} !important;
            }
            .character-speech.right::after {
                border-left-color: ${speechColor} !important;
            }
        `;
    },

    openImagePicker(charType) {
        if (this.isImagePickerOpen) return;
        this.isImagePickerOpen = true;
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            this.handleImageUpload(charType, e);
            this.isImagePickerOpen = false;
        };
        input.onclick = (e) => {
            setTimeout(() => {
                if (!input.files.length) {
                    this.isImagePickerOpen = false;
                }
            }, 100);
        };
        input.click();
    },

    handleImageUpload(charType, event) {
        const file = event.target.files[0];
        if (!file) {
            this.isImagePickerOpen = false;
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            if (charType === 'header') {
                // 헤더 배경 이미지만 설정
                const headerEl = document.querySelector('.pair-header');
                if (headerEl) {
                    headerEl.style.backgroundImage = `url(${e.target.result})`;
                    headerEl.classList.add('has-header-image');
                }
            } else {
                // 캐릭터 프로필 이미지 설정
                const avatarEl = document.getElementById(`${charType}-avatar`);
                if (avatarEl) {
                    avatarEl.style.backgroundImage = `url(${e.target.result})`;
                    avatarEl.classList.add('has-image');
                    Array.from(avatarEl.childNodes)
                        .filter(node => node.nodeType === 3)
                        .forEach(node => node.remove());
                }
            }
            this.isImagePickerOpen = false;
        };
        reader.readAsDataURL(file);
    },

    removeHeaderImage() {
        const headerEl = document.querySelector('.pair-header');
        if (headerEl) {
            headerEl.style.backgroundImage = '';
            headerEl.classList.remove('has-header-image');
        }
    },

    editKeyword(keywordElement) {
        keywordElement.contentEditable = true;
        keywordElement.focus();
        
        const range = document.createRange();
        range.selectNodeContents(keywordElement);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        keywordElement.addEventListener('blur', () => {
            keywordElement.contentEditable = false;
        }, { once: true });
    },

    addNewKeyword(keywordsContainer) {
        const newKeyword = document.createElement('span');
        newKeyword.className = 'keyword-tag';
        newKeyword.textContent = '새 키워드';
        newKeyword.contentEditable = true;
        
        const addBtn = keywordsContainer.querySelector('.add-keyword-btn');
        keywordsContainer.insertBefore(newKeyword, addBtn);
        
        newKeyword.focus();
        const range = document.createRange();
        range.selectNodeContents(newKeyword);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        newKeyword.addEventListener('blur', () => {
            newKeyword.contentEditable = false;
            if (newKeyword.textContent.trim() === '' || newKeyword.textContent === '새 키워드') {
                newKeyword.remove();
            }
        }, { once: true });
    },

    addTimelineItem() {
        const newItem = {
            date: '2024-01',
            title: '새 이벤트',
            desc: '새로운 타임라인 이벤트입니다.',
            image: null
        };

        this.timelineData.push(newItem);
        this.updateTimelineDisplay();
    },

    addImageToTimeline(index) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.timelineData[index].image = e.target.result;
                    this.updateTimelineDisplay();
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    },

    deleteTimelineItem(index) {
        if (confirm('이 타임라인 아이템을 삭제하시겠습니까?')) {
            this.timelineData.splice(index, 1);
            this.updateTimelineDisplay();
        }
    },

    deleteTimelineImage(index) {
        this.timelineData[index].image = null;
        this.updateTimelineDisplay();
    },

    addNewSection(charType) {
        const container = document.getElementById(`${charType}-extra-sections`);
        const sectionId = `${charType}-section-${Date.now()}`;

        const sectionEl = document.createElement('div');
        sectionEl.className = 'detail-section';
        sectionEl.innerHTML = `
            <div class="detail-title">
                <span class="section-title-text" ${this.isEditMode ? 'contenteditable="true"' : ''}>새 섹션</span>
                <div class="section-controls">
                    <button class="section-btn" onclick="app.addImageToSection(this)">🖼️</button>
                    <button class="section-btn" onclick="app.deleteSection(this)">🗑️</button>
                </div>
            </div>
            <div class="detail-content" id="${sectionId}" ${this.isEditMode ? 'contenteditable="true"' : ''}>새로운 섹션의 내용을 입력하세요.</div>
        `;

        container.appendChild(sectionEl);
        // 대표컬러 적용
const currentColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
if (currentColor && currentColor !== '#333') {
    this.forceApplyColors(currentColor);
}

        // 다크모드 체크 및 적용
        if (document.body.classList.contains('dark-mode')) {
            sectionEl.classList.add('dark-mode-section');
        }

        if (this.isEditMode) {
            const titleElement = sectionEl.querySelector('.section-title-text');
            titleElement.focus();
            
            const range = document.createRange();
            range.selectNodeContents(titleElement);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            const contentEl = sectionEl.querySelector('.detail-content');
            contentEl.classList.add('editable-text');
        }
    },

    // 이미지 전용 모드 확인 및 적용 함수
    checkImageOnlyMode(contentElement) {
        const textContent = contentElement.textContent.trim();
        const hasImage = contentElement.querySelector('.section-image');
        
        if (hasImage && textContent === '') {
            contentElement.classList.add('image-only');
        } else {
            contentElement.classList.remove('image-only');
        }
    },

    addImageToSection(button) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const section = button.closest('.detail-section');
                    const contentEl = section.querySelector('.detail-content');
                    
                    // 기존 이미지 제거
                    const existingImg = contentEl.querySelector('.section-image');
                    if (existingImg) existingImg.remove();

                    // 새 이미지 생성 및 추가
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.className = 'section-image';
                    contentEl.appendChild(img);
                    
                    // 이미지만 있는지 확인하고 스타일 적용
                    this.checkImageOnlyMode(contentEl);
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    },

    deleteSection(button) {
        if (confirm('이 섹션을 삭제하시겠습니까?')) {
            const section = button.closest('.detail-section');
            section.remove();
        }
    },

    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    disableEditing() {
        const editableElements = document.querySelectorAll('.editable-text');
        editableElements.forEach(element => {
            element.contentEditable = false;
            element.classList.remove('editable-text');
        });

        const sectionTitles = document.querySelectorAll('.section-title-text');
        sectionTitles.forEach(title => {
            title.contentEditable = false;
        });

        const timelineElements = document.querySelectorAll('.timeline-date, .timeline-title-text, .timeline-desc');
        timelineElements.forEach(element => {
            element.contentEditable = false;
        });
    },

    toggleStickerPanel() {
        const panel = document.getElementById('sticker-panel');
        panel.classList.toggle('active');
    },

    closeStickerPanel() {
        const panel = document.getElementById('sticker-panel');
        panel.classList.remove('active');
    },

    setupEventListeners() {
        const stickerUpload = document.getElementById('input-sticker-upload');
        if (stickerUpload) {
            stickerUpload.addEventListener('change', (e) => this.handleStickerUpload(e));
        }
        
        // 외부 클릭으로 스티커 비활성화
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.fairtle-sticker') && 
                !e.target.closest('.sticker-panel')) {
                this.deactivateAllStickers();
            }
        });
    },

    handleStickerUpload(event) {
        const files = event.target.files;
        const container = document.getElementById('sticker-preview-container');
        
        if (this.stickerData.length === 0) {
            container.innerHTML = '';
        }

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const stickerId = `sticker-${Date.now()}-${Math.random()}`;
                this.stickerData.push({
                    id: stickerId,
                    src: e.target.result,
                    name: file.name
                });
                this.createStickerPreview(stickerId, e.target.result);
            };
            reader.readAsDataURL(file);
        });
    },

    createStickerPreview(stickerId, src) {
        const container = document.getElementById('sticker-preview-container');
        const previewDiv = document.createElement('div');
        previewDiv.className = 'sticker-preview';
        previewDiv.onclick = () => this.addStickerToCard(stickerId, src);
        
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'sticker';
        
        previewDiv.appendChild(img);
        container.appendChild(previewDiv);
    },

    addStickerToCard(stickerId, src) {
        const fairtle = document.getElementById('fairtle-card');
        const stickerEl = document.createElement('div');
        const placedId = `placed-${Date.now()}-${Math.random()}`;

        stickerEl.className = 'fairtle-sticker';
        stickerEl.id = placedId;
        stickerEl.style.cssText = `
            position: absolute; 
            left: 100px; 
            top: 100px; 
            width: 80px; 
            height: 80px; 
            z-index: 100;
            transform: rotate(0deg);
            border: 2px solid transparent;
        `;

        stickerEl.innerHTML = `
            <div class="rotate-handle"></div>
            <div class="resize-handle"></div>
            <div class="sticker-controls">
                <button class="sticker-control-btn delete-btn" onclick="app.deleteSticker('${placedId}')">×</button>
            </div>
            <img src="${src}" style="width: 100%; height: 100%; object-fit: contain; pointer-events: none;" draggable="false">
        `;

        // 스티커 클릭 이벤트
        stickerEl.addEventListener('click', (e) => {
            e.stopPropagation();
            this.activateSticker(stickerEl);
        });

        // 드래그, 회전, 크기조절 기능 추가
        this.makeDraggable(stickerEl);
        this.makeRotatable(stickerEl);
        this.makeResizable(stickerEl);
        
        fairtle.appendChild(stickerEl);
        
        // 새로 추가된 스티커 활성화
        this.activateSticker(stickerEl);
    },

    activateSticker(stickerEl) {
        // 모든 스티커 비활성화
        this.deactivateAllStickers();
        // 선택된 스티커 활성화
        stickerEl.classList.add('active');
    },

    deactivateAllStickers() {
        document.querySelectorAll('.fairtle-sticker').forEach(s => s.classList.remove('active'));
    },

    makeDraggable(element) {
        let isDragging = false;
        let startX, startY, initialX, initialY;

        element.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('sticker-control-btn') || 
                e.target.classList.contains('rotate-handle') || 
                e.target.classList.contains('resize-handle')) return;
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = element.offsetLeft;
            initialY = element.offsetTop;
            
            element.style.cursor = 'grabbing';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            element.style.left = `${initialX + deltaX}px`;
            element.style.top = `${initialY + deltaY}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.style.cursor = 'move';
            }
        });
    },

    makeRotatable(element) {
        const rotateHandle = element.querySelector('.rotate-handle');
        let isRotating = false;

        rotateHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            e.preventDefault();
            isRotating = true;
            
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
            
            const currentTransform = element.style.transform || '';
            const match = currentTransform.match(/rotate\((-?\d+(?:\.\d+)?)deg\)/);
            const currentRotation = match ? parseFloat(match[1]) : 0;
            
            rotateHandle.style.cursor = 'grabbing';

            const handleMouseMove = (e) => {
                if (!isRotating) return;
                
                e.preventDefault();
                
                const rect = element.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
                const angleDiff = currentAngle - startAngle;
                const newRotation = currentRotation + angleDiff;
                
                element.style.transform = `rotate(${newRotation}deg)`;
            };

            const handleMouseUp = () => {
                isRotating = false;
                rotateHandle.style.cursor = 'grab';
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });
    },

    makeResizable(element) {
        const resizeHandle = element.querySelector('.resize-handle');
        let isResizing = false;

        resizeHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            e.preventDefault();
            isResizing = true;
            
            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = element.offsetWidth;
            const startHeight = element.offsetHeight;
            
            // 실제 이미지의 원본 비율 구하기
            const img = element.querySelector('img');
            const imageAspectRatio = img && img.naturalWidth && img.naturalHeight 
                ? img.naturalWidth / img.naturalHeight 
                : startWidth / startHeight; // 이미지 없으면 현재 비율 사용
            
            resizeHandle.style.cursor = 'nw-resize';

            const handleMouseMove = (e) => {
                if (!isResizing) return;
                
                e.preventDefault();
                
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                
                // X축 변화량을 기준으로 이미지 원본 비율 유지
                const newWidth = Math.max(20, startWidth + deltaX);
                const newHeight = newWidth / imageAspectRatio;
                
                element.style.width = `${newWidth}px`;
                element.style.height = `${newHeight}px`;
            };

            const handleMouseUp = () => {
                isResizing = false;
                resizeHandle.style.cursor = 'nw-resize';
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });
    },

    deleteSticker(stickerId) {
        const sticker = document.getElementById(stickerId);
        if (sticker) {
            sticker.remove();
        }
    },

    toggleDarkMode() {
        const body = document.body;
        const toggle = document.querySelector('.darkmode-toggle');
        
        body.classList.toggle('dark-mode');
        toggle.classList.toggle('active');
        
        // localStorage 사용 (에러 방지)
        try {
            const isDark = body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark);
        } catch (e) {
            // localStorage 사용 불가능한 환경에서는 무시
        }
    },

    downloadImage() {
        // 스티커 모두 비활성화 후 다운로드
        this.deactivateAllStickers();
        
        const element = document.querySelector('.fairtle-card');
        
        html2canvas(element, {
            scale: 2,
            backgroundColor: '#ffffff',
            useCORS: true,
            allowTaint: true
        }).then(canvas => {
            const link = document.createElement('a');
            const pairTitle = document.getElementById('pair-title').textContent || 'fairtle';
            // 앞뒤 공백 제거 후 가운데 공백만 언더바로 변경
            const cleanTitle = pairTitle.trim().replace(/\s+/g, '_');
            link.download = `${cleanTitle}_페어틀.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(error => {
            console.error('저장 실패:', error);
            alert('이미지 저장에 실패했습니다.');
        });
    }
};

// DOM 로드 완료 후 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    app.init();
    
    // localStorage 에러 방지
    try {
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode === 'true') {
            document.body.classList.add('dark-mode');
            document.querySelector('.darkmode-toggle').classList.add('active');
        }
    } catch (e) {
        // localStorage 사용 불가능한 환경에서는 무시
    }
    
    // 섹션 내용 변경 감지하여 이미지 전용 모드 체크
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('detail-content')) {
            app.checkImageOnlyMode(e.target);
        }
        
        // 출처란 내용 변경 감지
        if (e.target.id === 'source-credit') {
            app.checkSourceCredit();
        }
    });
    
    console.log('페어틀 생성기 완성! 모든 기능 작동중');
});
