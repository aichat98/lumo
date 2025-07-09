// --- 전역 변수 ---
let currentSkin = 'kakao', currentScreen = 'lock', currentMusicSkin = 'glass-card', currentLockFont = 'default';
let messages = [], currentAlbumArt = null, musicTitle = '밤양갱', musicArtist = '비비 (BIBI)';

// --- [수정 1] 이미지 첨부시 삭제버튼 표시 함수 추가 ---
function toggleDeleteButton(inputId) {
    const inputElement = document.getElementById(inputId);
    const deleteBtn = inputElement.parentNode.querySelector('.delete-btn');
    
    if (inputElement.files && inputElement.files.length > 0) {
        deleteBtn.classList.add('show');
    } else {
        deleteBtn.classList.remove('show');
    }
}

// --- 스크린샷 기능 (복원 및 개선) ---
async function drawCanvasFromWrapper(width, height) { const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d'); const wrapper = document.querySelector('.phone-wrapper'); const bgStyle = getComputedStyle(wrapper); if (bgStyle.backgroundImage !== 'none' && bgStyle.backgroundImage !== 'initial') { const img = new Image(); img.crossOrigin = 'Anonymous'; img.src = bgStyle.backgroundImage.match(/url\("?(.*?)"?\)/)[1]; await new Promise(resolve => { img.onload = () => { const scale = 1.2; const scaledWidth = width * scale; const scaledHeight = height * scale; const offsetX = (scaledWidth - width) / 2; const offsetY = (scaledHeight - height) / 2; const imgRatio = img.width / img.height; const canvasRatio = scaledWidth / scaledHeight; let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height; if (imgRatio > canvasRatio) { sWidth = img.height * canvasRatio; sx = (img.width - sWidth) / 2; } else { sHeight = img.width / canvasRatio; sy = (img.height - sHeight) / 2; } ctx.save(); ctx.filter = 'blur(8px)'; ctx.drawImage(img, sx, sy, sWidth, sHeight, -offsetX, -offsetY, scaledWidth, scaledHeight); ctx.restore(); ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; ctx.fillRect(0, 0, width, height); resolve(); }; img.onerror = () => { ctx.fillStyle = '#f0f0f0'; ctx.fillRect(0, 0, width, height); resolve(); }; }); } else { ctx.fillStyle = bgStyle.backgroundColor || '#f0f0f0'; ctx.fillRect(0, 0, width, height); } return canvas; }
function drawPhoneBezel(ctx, x, y, width, height) { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 15; ctx.fillStyle = '#333'; ctx.beginPath(); ctx.roundRect(x - 3, y - 3, width + 6, height + 6, 53); ctx.fill(); ctx.shadowColor = 'transparent'; ctx.fillStyle = '#666'; ctx.beginPath(); ctx.roundRect(x - 1, y - 1, width + 2, height + 2, 51); ctx.fill(); const gradient = ctx.createLinearGradient(x, y, x + width, y + height); gradient.addColorStop(0, '#2a2a2a'); gradient.addColorStop(1, '#000'); ctx.fillStyle = gradient; ctx.beginPath(); ctx.roundRect(x, y, width, height, 50); ctx.fill(); ctx.fillStyle = '#333'; ctx.fillRect(x - 4, y + 140, 4, 35); ctx.fillRect(x - 4, y + 185, 4, 35); ctx.fillRect(x + width, y + 160, 4, 55); ctx.restore(); }
function drawPhoneNotch(ctx, x, y, width, height) { 
    ctx.save(); 
    // 그림자 완전 제거
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = '#000'; 
    ctx.beginPath(); 
    ctx.roundRect(x + (width / 2) - 52.5, y + 15, 105, 20, 10); 
    ctx.fill(); 
    ctx.restore(); 
}
async function saveScreenshot() { 
    const phoneScreen = document.getElementById('screen'); 
    const finalWidth = 550, finalHeight = 950; 
    const phoneWidth = 350, phoneHeight = 750; 
    const paddingX = (finalWidth - phoneWidth) / 2; 
    const paddingY = (finalHeight - phoneHeight) / 2; 
    const finalCanvas = await drawCanvasFromWrapper(finalWidth, finalHeight); 
    const ctx = finalCanvas.getContext('2d'); 
    drawPhoneBezel(ctx, paddingX, paddingY, phoneWidth, phoneHeight); 
    const screenCanvas = await html2canvas(phoneScreen, { backgroundColor: null, scale: 2, useCORS: true, allowTaint: true }); 
    ctx.drawImage(screenCanvas, paddingX + 8, paddingY + 8, phoneWidth - 16, phoneHeight - 16); 
    drawPhoneNotch(ctx, paddingX, paddingY, phoneWidth, phoneHeight); 
    
    const pairNameEl = document.getElementById('pairName'); 
    if (pairNameEl && pairNameEl.textContent) { 
        // 배경색에 따른 페어명 색상 결정
        const wrapper = document.getElementById('phoneWrapper');
        const bgStyle = getComputedStyle(wrapper);
        let pairNameColor = '#888888'; // 기본색
        
        if (bgStyle.backgroundImage !== 'none' && bgStyle.backgroundImage !== 'initial') {
            // 이미지 배경일 때는 흰색 + 그림자
            pairNameColor = '#FFFFFF';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetY = 2;
        } else if (bgStyle.backgroundColor && bgStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            // 색상 배경일 때는 밝기 계산
            const rgb = bgStyle.backgroundColor.match(/\d+/g);
            if (rgb) {
                const brightness = (parseInt(rgb[0])*299 + parseInt(rgb[1])*587 + parseInt(rgb[2])*114) / 1000;
                if (brightness < 128) {
                    pairNameColor = '#FFFFFF';
                    ctx.shadowColor = 'rgba(0,0,0,0.8)';
                    ctx.shadowBlur = 4;
                    ctx.shadowOffsetY = 2;
                }
            }
        }
        
        ctx.font = '500 14px -apple-system, sans-serif'; 
        ctx.fillStyle = pairNameColor; 
        ctx.globalAlpha = 0.5; // 50% 투명도
        ctx.textAlign = 'right'; 
        ctx.textBaseline = 'top'; 
        ctx.fillText(pairNameEl.textContent, finalWidth - 20, 20); 
        ctx.shadowColor = 'transparent';
        ctx.globalAlpha = 1.0; // 투명도 복원
    } 
    
    const link = document.createElement('a'); 
    link.download = `screenshot_${Date.now()}.png`; 
    link.href = finalCanvas.toDataURL('image/png'); 
    link.click(); 
}
async function saveAllScreenshots() { 
    const phoneScreen = document.getElementById('screen'); 
    const phoneWidth = 350, phoneHeight = 750; 
    const spacing = 40, margin = 50; 
    const totalWidth = (phoneWidth * 3) + (spacing * 2) + (margin * 2); 
    const totalHeight = phoneHeight + (margin * 2) + 40; 
    const finalCanvas = await drawCanvasFromWrapper(totalWidth, totalHeight); 
    const ctx = finalCanvas.getContext('2d'); 
    
    // 배경색에 따른 라벨 색상 결정
    const wrapper = document.getElementById('phoneWrapper');
    const bgStyle = getComputedStyle(wrapper);
    let labelColor = '#333'; // 기본 어두운 색
    
    if (bgStyle.backgroundImage !== 'none' && bgStyle.backgroundImage !== 'initial') {
        // 이미지 배경일 때는 흰색 + 그림자
        labelColor = '#FFFFFF';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;
    } else if (bgStyle.backgroundColor && bgStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        // 색상 배경일 때는 밝기 계산
        const rgb = bgStyle.backgroundColor.match(/\d+/g);
        if (rgb) {
            const brightness = (parseInt(rgb[0])*299 + parseInt(rgb[1])*587 + parseInt(rgb[2])*114) / 1000;
            if (brightness < 128) {
                labelColor = '#FFFFFF';
                ctx.shadowColor = 'rgba(0,0,0,0.8)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetY = 2;
            }
        }
    }
    
    const screensToCapture = [ 
        { name: 'lock', label: '잠금화면' }, 
        { name: 'home', label: '홈화면' }, 
        { name: 'chat', label: '카톡화면' }
    ]; 
    const originalScreen = currentScreen; 
    
    for (let i = 0; i < screensToCapture.length; i++) { 
        const screenInfo = screensToCapture[i]; 
        switchScreen(screenInfo.name); 
        await new Promise(r => setTimeout(r, 100)); 
        const phoneX = margin + (phoneWidth + spacing) * i; 
        const phoneY = margin; 
        drawPhoneBezel(ctx, phoneX, phoneY, phoneWidth, phoneHeight); 
        const screenCanvas = await html2canvas(phoneScreen, { backgroundColor: null, scale: 2, useCORS: true, allowTaint: true }); 
        ctx.drawImage(screenCanvas, phoneX + 8, phoneY + 8, phoneWidth - 16, phoneHeight - 16); 
        drawPhoneNotch(ctx, phoneX, phoneY, phoneWidth, phoneHeight); 
        
        ctx.fillStyle = labelColor; 
        ctx.font = '16px -apple-system, sans-serif'; 
        ctx.textAlign = 'center'; 
        ctx.textBaseline = 'bottom'; 
        ctx.fillText(screenInfo.label, phoneX + phoneWidth / 2, phoneY + phoneHeight + 30); 
    } 
    
    const pairNameEl = document.getElementById('pairName'); 
    if (pairNameEl && pairNameEl.textContent) { 
        ctx.fillStyle = labelColor;
        ctx.globalAlpha = 0.5; // 50% 투명도
        ctx.font = '500 14px -apple-system, sans-serif'; 
        ctx.textAlign = 'right'; 
        ctx.textBaseline = 'top'; 
        ctx.fillText(pairNameEl.textContent, totalWidth - 20, 20); 
        ctx.globalAlpha = 1.0; // 투명도 복원
    } 
    
    // 그림자 초기화
    ctx.shadowColor = 'transparent';
    
    const link = document.createElement('a'); 
    link.download = `all_screens_${Date.now()}.png`; 
    link.href = finalCanvas.toDataURL('image/png'); 
    link.click(); 
    switchScreen(originalScreen); 
}

// --- 핵심 기능 함수 ---
function renderMusicWidget() { const container = document.getElementById('lockMusicWidget'); const artUrl = currentAlbumArt || 'https://i.imgur.com/R3pE3vj.png'; const lyrics = document.getElementById('lyricsInput').value || '달디달고 달디달고 달디단 밤양갱...'; let playerHTML = ''; switch (currentMusicSkin) { case 'glass-card': playerHTML = `<div class="music-widget skin-glass-card"><div class="album-art" style="background-image: url('${artUrl}')"></div><div class="info"><div class="title">${musicTitle}</div><div class="artist">${musicArtist}</div></div><div class="music-controls"><i class="fa-solid fa-play"></i><i class="fa-solid fa-forward-step"></i></div></div>`; break; case 'minimalist': playerHTML = `<div class="music-widget skin-minimalist"><div class="info"><div class="title">${musicTitle}</div><div class="artist">${musicArtist}</div></div><div class="progress-container"><div class="progress-bar"><div class="progress"></div></div><div class="time-stamps"><span>1:02</span><span>2:33</span></div></div><div class="music-controls"><i class="fa-solid fa-shuffle"></i><i class="fa-solid fa-backward-step"></i><i class="fa-solid fa-circle-play play-btn"></i><i class="fa-solid fa-forward-step"></i><i class="fa-solid fa-repeat"></i></div></div>`; break; case 'album-cover': playerHTML = `<div class="music-widget skin-album-cover" style="background-image: url('${artUrl}')"><div class="info"><div class="title">${musicTitle}</div><div class="artist">${musicArtist}</div></div><div class="music-controls"><i class="fa-solid fa-backward-step"></i><i class="fa-solid fa-pause"></i><i class="fa-solid fa-forward-step"></i></div></div>`; break; case 'lyrics': playerHTML = `<div class="music-widget skin-lyrics"><div class="album-art" style="background-image: url('${artUrl}')"></div><div class="info"><div class="title">${musicTitle}</div><div class="artist">${musicArtist}</div></div><div class="lyrics-text">${lyrics.replace(/\n/g, '<br>')}</div><div class="music-controls"><i class="fa-solid fa-backward-step"></i><i class="fa-solid fa-circle-pause play-btn"></i><i class="fa-solid fa-forward-step"></i></div></div>`; break; } container.innerHTML = playerHTML; }
function switchScreen(screen) { 
    ['lockScreen', 'homeScreen', 'chatScreen'].forEach(id => { 
        const el = document.getElementById(id); 
        el.style.display = 'none'; 
        el.classList.remove('active'); 
    }); 
    const targetScreen = document.getElementById(`${screen}Screen`); 
    targetScreen.style.display = 'flex'; 
    targetScreen.classList.add('active'); 
    
    // 카톡화면일 때만 기본 스킨 설정, 다른 화면은 현재 스킨 유지
    if (screen === 'chat' && !document.getElementById('screen').className.includes('imessage') && !document.getElementById('screen').className.includes('line')) {
        const chatScreen = document.getElementById('chatScreen');
        const currentBg = getComputedStyle(chatScreen).backgroundImage;
        if (currentBg === 'none') {
            changeSkin('kakao');
        }
    }
    
    document.querySelector('.controls').className = `controls screen-${screen}`; 
    document.querySelectorAll('.screen-btn').forEach(btn => btn.classList.remove('active')); 
    document.querySelector(`.screen-btn[onclick="switchScreen('${screen}')"]`).classList.add('active'); 
}

// --- [수정 2] 카카오톡 테마 색상 적용을 위한 전역 변수 추가 ---
window.currentThemeColor = null;

function parseCommand() { 
    const command = document.getElementById('commandInput').value.trim(); 
    if (!command) return; 
    clearTimeout(window.parseCommandTimer); 
    window.parseCommandTimer = setTimeout(() => { 
        const cleanCommand = command.replace(/\[OOC.*?\]/, '').trim(); 
        const matches = cleanCommand.match(/\[(.*?)\]/g); 
        if (!matches || matches.length < 9) return; 
        
        const colorCode = matches[0].slice(1, -1); 
        
        // --- [수정 2] 테마 색상 저장 ---
        window.currentThemeColor = colorCode;
        
        applyGlobalTheme(colorCode); 
        setupHomeApps(command, colorCode); 
        musicTitle = matches[7].slice(1, -1); 
        musicArtist = matches[8].slice(1, -1); 
        renderMusicWidget(); 
        
        const profileEmoji = matches[5].slice(1, -1); 
        const profilePic = document.getElementById('profilePic'); 
        if (profileEmoji.startsWith('http') || profileEmoji.startsWith('data:')) { 
            profilePic.innerHTML = `<img src="${profileEmoji}" alt="프로필">`; 
        } else { 
            profilePic.textContent = profileEmoji; 
        } 
        
        document.querySelector('.chat-name').textContent = matches[3].slice(1, -1); 
        
        const appType = matches[6].slice(1, -1); 
        const appMap = {'카카오톡': 'kakao', '아이메세지': 'imessage', '라인': 'line'}; 
        changeSkin(appMap[appType] || 'kakao'); 
        
        messages = []; 
        const messageStart = cleanCommand.indexOf(matches[8]) + matches[8].length; 
        const messageText = cleanCommand.substring(messageStart).trim(); 
        const messagePattern = /(<.*?>\s*<.*?>|\(.*\)\s*\(.*\))/g; 
        const rawMessages = messageText.match(messagePattern) || []; 
        
        rawMessages.forEach(rawMsg => { 
            if (rawMsg.startsWith('<')) { 
                const parts = rawMsg.match(/<(.*?)>\s*<(.*?)>/); 
                if(parts) messages.push({ type: 'sent', text: parts[1], time: parts[2] }); 
            } else if (rawMsg.startsWith('(')) { 
                const parts = rawMsg.match(/\((.*?)\)\s*\((.*?)\)/); 
                if(parts) messages.push({ type: 'received', text: parts[1], time: parts[2] }); 
            } 
        }); 
        
        renderMessages(); 
        
        if (messages.length > 0) { 
            const lastMessage = messages[messages.length - 1]; 
            const timeOnly = lastMessage.time.replace('오전 ', '').replace('오후 ', ''); 
            ['statusTime', 'lockStatusTime', 'homeStatusTime', 'lockHour'].forEach(id => { 
                document.getElementById(id).textContent = timeOnly; 
            }); 
        } 
    }, 500); 
}

function clearAll() { 
    messages = []; 
    window.currentThemeColor = null; // 테마 색상 초기화
    renderMessages(); 
    ['commandInput', 'chatnameInput', 'pairNameInput', 'lockDateInput', 'lyricsInput', 'profileImageInput', 'imageInput', 'albumArtInput'].forEach(id => { 
        if(document.getElementById(id)) document.getElementById(id).value = ''; 
    }); 
    
    // 모든 삭제 버튼 숨기기
    document.querySelectorAll('.delete-btn').forEach(btn => btn.classList.remove('show'));
    
    document.getElementById('profilePic').textContent = '🐱'; 
    document.querySelector('.chat-name').textContent = '채팅방'; 
    document.getElementById('pairName').textContent = ''; 
    document.getElementById('lockDate').textContent = 'March 15, Wednesday'; 
    ['statusTime', 'lockStatusTime', 'homeStatusTime', 'lockHour'].forEach(id => document.getElementById(id).textContent = '9:41'); 
    
    const phoneWrapper = document.getElementById('phoneWrapper'); 
    phoneWrapper.style.background = ''; 
    phoneWrapper.classList.remove('has-image'); 
    document.getElementById('lockScreen').style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; 
    document.getElementById('homeScreen').style.background = 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'; 
    document.getElementById('chatScreen').style.backgroundImage = ''; 
    document.getElementById('homeScreen').querySelector('.status-bar').style.color = '#000'; 
    document.getElementById('appGrid').innerHTML = ''; 
    
    currentAlbumArt = null; 
    musicTitle = '밤양갱'; 
    musicArtist = '비비 (BIBI)'; 
    changeSkin('kakao'); 
    changeMusicSkin('glass-card'); 
    changeLockFont('default'); 
    renderMusicWidget(); 
    switchScreen('lock'); 
    updatePairNameColor(); 
}

// --- [수정 2] 카카오톡 테마에서 색상 적용 함수 수정 ---
function applyGlobalTheme(colorCode) { 
    document.getElementById('phoneWrapper').style.background = colorCode; 
    document.getElementById('lockScreen').style.background = colorCode; 
    setHomeBackgroundFromUrl(null, colorCode); 
    
    // 카카오톡에서 테마 색상 적용
    if (currentSkin === 'kakao') {
        applyChatTheme(colorCode);
    }
    
    updatePairNameColor(); 
}

// --- [수정 2] 카카오톡에서만 테마 색상 적용 ---
function applyChatTheme(colorCode) {
    if (!colorCode || currentSkin !== 'kakao') return; // 카카오톡에서만 적용
    
    try {
        // 헥사 코드를 RGB로 변환
        const hex = colorCode.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // 채팅방 배경은 원색보다 옅게 (투명도 0.3 적용)
        const chatBgColor = `rgba(${r}, ${g}, ${b}, 0.3)`;
        
        const chatScreen = document.getElementById('chatScreen');
        if (getComputedStyle(chatScreen).backgroundImage === 'none') {
            chatScreen.style.setProperty('background-color', chatBgColor, 'important');
        }
        
        // 전송 메시지와 전송 버튼은 원색 사용
        window.currentThemeColor = colorCode;
        
        // 기존 메시지들에도 색상 적용
        renderMessages();
        
    } catch(e) {
        console.log('테마 색상 적용 실패:', e);
    }
}

function autoResize(textarea) { textarea.style.height = 'auto'; textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'; }

// --- [수정 2] 메시지 렌더링에서 테마 색상 적용 ---
function renderMessages() { 
    const container = document.getElementById('chatMessages'); 
    container.innerHTML = ''; 
    messages.forEach(msg => { 
        const messageDiv = document.createElement('div'); 
        messageDiv.className = `message ${msg.type}`; 
        if (msg.type === 'sent') { 
            messageDiv.innerHTML = `<span class="message-time">${msg.time}</span><div class="message-bubble">${msg.text}</div>`; 
            // 테마 색상 적용 (원색)
            if (window.currentThemeColor && currentSkin === 'kakao') {
                const bubble = messageDiv.querySelector('.message-bubble');
                bubble.style.setProperty('background-color', window.currentThemeColor, 'important');
                
                // 헥사코드 밝기에 따라 글자색 결정
                const hex = window.currentThemeColor.replace('#', '');
                const r = parseInt(hex.substr(0, 2), 16);
                const g = parseInt(hex.substr(2, 2), 16);
                const b = parseInt(hex.substr(4, 2), 16);
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                
                // 밝기에 따라 글자색 설정
                const textColor = brightness > 128 ? '#000' : '#fff';
                bubble.style.setProperty('color', textColor, 'important');
            }
        } else { 
            messageDiv.innerHTML = `<div class="message-bubble">${msg.text}</div><span class="message-time">${msg.time}</span>`; 
        } 
        container.appendChild(messageDiv); 
    }); 
    container.scrollTop = container.scrollHeight; 
    
    // 전송 버튼에도 테마 색상 적용 (원색)
    if (window.currentThemeColor && currentSkin === 'kakao') {
        const sendButton = document.querySelector('#chatScreen .send-button');
        if (sendButton) {
            sendButton.style.setProperty('background-color', window.currentThemeColor, 'important');
            
            // 버튼 아이콘 색상도 밝기에 따라 설정
            const hex = window.currentThemeColor.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            
            const iconColor = brightness > 128 ? '#000' : '#fff';
            sendButton.style.setProperty('color', iconColor, 'important');
        }
    }
}

function updateProfileImage() { 
    const imageFile = document.getElementById('profileImageInput').files[0]; 
    if (imageFile) { 
        const reader = new FileReader(); 
        reader.onload = e => document.getElementById('profilePic').innerHTML = `<img src="${e.target.result}" alt="프로필">`; 
        reader.readAsDataURL(imageFile); 
    } 
}

function updateChatname() { const chatname = document.getElementById('chatnameInput').value.trim(); if (chatname) document.querySelector('.chat-name').textContent = chatname; }
function updatePairName() { document.getElementById('pairName').textContent = document.getElementById('pairNameInput').value.trim(); updatePairNameColor(); }
function updateLockDate() { const customDate = document.getElementById('lockDateInput').value.trim(); document.getElementById('lockDate').textContent = customDate || 'March 15, Wednesday'; }

function updateAlbumArt() { 
    const imageFile = document.getElementById('albumArtInput').files[0]; 
    if (imageFile) { 
        const reader = new FileReader(); 
        reader.onload = e => { 
            currentAlbumArt = e.target.result; 
            renderMusicWidget(); 
        }; 
        reader.readAsDataURL(imageFile); 
    } else { 
        currentAlbumArt = null; 
        renderMusicWidget(); 
    } 
}

function changeLockFont(font) { currentLockFont = font; const lockHour = document.getElementById('lockHour'); lockHour.classList.remove('font-default', 'font-heavy', 'font-serif'); lockHour.classList.add(`font-${font}`); document.querySelectorAll('.font-skin-btn').forEach(btn => btn.classList.remove('active')); document.querySelector(`.font-skin-btn[onclick="changeLockFont('${font}')"]`).classList.add('active'); }

// --- [수정 2] 스킨 변경시 테마 색상도 함께 적용 ---
function changeSkin(skin) { 
    currentSkin = skin; // 현재 스킨 저장
    document.getElementById('screen').className = 'screen ' + skin; 
    
    if (skin === 'kakao') {
        const chatScreen = document.getElementById('chatScreen');
        const currentBg = getComputedStyle(chatScreen).backgroundImage;
        if (currentBg === 'none') {
            // 현재 테마 색상이 있으면 적용
            if (window.currentThemeColor) {
                applyChatTheme(window.currentThemeColor);
            } else {
                // 기본 배경색
                const wrapperBg = getComputedStyle(document.getElementById('phoneWrapper')).backgroundColor;
                if (wrapperBg && wrapperBg !== 'rgba(0, 0, 0, 0)') {
                    chatScreen.style.setProperty('background-color', wrapperBg, 'important');
                } else {
                    chatScreen.style.setProperty('background-color', '#b2c7da', 'important');
                }
            }
        }
        // 메시지 다시 렌더링하여 테마 색상 적용
        renderMessages();
    }
    
    document.querySelectorAll('.skin-btn').forEach(btn => btn.classList.remove('active')); 
    document.querySelector(`.skin-btn[onclick="changeSkin('${skin}')"]`).classList.add('active'); 
}

function changeMusicSkin(skin) { currentMusicSkin = skin; renderMusicWidget(); document.querySelectorAll('.music-skin-btn').forEach(btn => btn.classList.remove('active')); document.querySelector(`.music-skin-btn[onclick="changeMusicSkin('${skin}')"]`).classList.add('active'); const lyricsInputGroup = document.getElementById('lyricsInputGroup'); lyricsInputGroup.style.display = (skin === 'lyrics') ? 'block' : 'none'; }
function openCommandHelp() { document.getElementById('popupOverlay').style.display = 'flex'; }
function closeCommandHelp() { document.getElementById('popupOverlay').style.display = 'none'; }
function copyCommandTemplate() { 
    const template = `[OOC 모드 - 롤플레이 잠시 정지]

다음 양식으로만 답변:
[{색상코드}]
[{핸드폰 홈배경 어플 이모지들}][{어플 이름들}]
[{sns 유저 저장명}]
[{sns 캐릭터 저장명}]
[{캐릭터 이모지}]
[{카카오톡/아이메세지/라인}]
[{음악 제목}]
[{음악 아티스트}]

< > = 유저 메시지 (오른쪽)
( ) = 캐릭터 메시지 (왼쪽)

<{sns 유저 메시지}> <{오후/오전 시간}>
({sns 캐릭터 메시지}) ({오후/오전 시간})`; 
    navigator.clipboard.writeText(template).then(() => { 
        alert('명령어가 클립보드에 복사되었습니다!'); 
        closeCommandHelp(); 
    }, () => { 
        alert('복사에 실패했습니다.'); 
    }); 
}

document.addEventListener('DOMContentLoaded', () => { switchScreen('lock'); renderMusicWidget(); updatePairNameColor(); document.getElementById('popupOverlay').addEventListener('click', e => { if (e.target === e.currentTarget) closeCommandHelp(); }); autoResize(document.getElementById('commandInput')); });

function updatePairNameColor() { 
    const wrapper = document.getElementById('phoneWrapper'); 
    const pairNameElement = document.getElementById('pairName'); 
    const bgStyle = getComputedStyle(wrapper); 
    
    if (bgStyle.backgroundImage !== 'none' && bgStyle.backgroundImage !== 'initial') { 
        pairNameElement.style.color = '#FFFFFF'; 
        pairNameElement.style.textShadow = '1px 1px 3px rgba(0,0,0,0.7)'; 
    } else { 
        const rgb = bgStyle.backgroundColor.match(/\d+/g); 
        if (rgb) { 
            const brightness = (parseInt(rgb[0])*299 + parseInt(rgb[1])*587 + parseInt(rgb[2])*114) / 1000; 
            if (brightness > 128) { 
                pairNameElement.style.color = '#888888'; 
                pairNameElement.style.textShadow = 'none'; 
            } else { 
                pairNameElement.style.color = '#FFFFFF'; 
                pairNameElement.style.textShadow = '1px 1px 3px rgba(0,0,0,0.7)'; 
            } 
        } else { 
            pairNameElement.style.color = '#888888'; 
            pairNameElement.style.textShadow = 'none'; 
        } 
    }
    
    // 항상 50% 투명도 적용
    pairNameElement.style.opacity = '0.5';
}

function updateBackground() { 
    const imageFile = document.getElementById('imageInput').files[0]; 
    if (imageFile) { 
        const reader = new FileReader(); 
        reader.onload = e => { 
            document.getElementById('phoneWrapper').style.background = `url('${e.target.result}') center/cover no-repeat`; 
            document.getElementById('phoneWrapper').classList.add('has-image'); 
            updatePairNameColor(); 
        }; 
        reader.readAsDataURL(imageFile); 
    } 
}

function updateLockBackground() { 
    const imageFile = document.getElementById('lockImageInput').files[0]; 
    if (imageFile) { 
        const reader = new FileReader(); 
        reader.onload = function(e) { 
            const lockScreen = document.getElementById('lockScreen');
            lockScreen.style.setProperty('background', `url('${e.target.result}') center/cover no-repeat`, 'important');
        }; 
        reader.readAsDataURL(imageFile); 
    } 
}

function updateHomeBackground() { 
    const imageFile = document.getElementById('homeImageInput').files[0]; 
    if (imageFile) { 
        const reader = new FileReader(); 
        reader.onload = function(e) { 
            const homeScreen = document.getElementById('homeScreen');
            homeScreen.style.setProperty('background', `url('${e.target.result}') center/cover no-repeat`, 'important');
        }; 
        reader.readAsDataURL(imageFile); 
    } 
}

function updateChatBackground() { 
    const imageFile = document.getElementById('chatImageInput').files[0]; 
    if (imageFile) { 
        const reader = new FileReader(); 
        reader.onload = e => { 
            const currentSkin = document.getElementById('screen').className;
            
            // 카카오톡일 때만 배경 이미지 적용
            if (currentSkin.includes('kakao')) {
                const chatScreen = document.getElementById('chatScreen'); 
                chatScreen.style.cssText += `background: url('${e.target.result}') center/cover no-repeat !important;`;
                
                // 채팅 화면의 상단/하단만 투명하게
                const chatStatusBar = document.querySelector('#chatScreen .status-bar');
                const chatHeader = document.querySelector('#chatScreen .chat-header');
                const chatInputArea = document.querySelector('#chatScreen .chat-input-area');
                
                chatStatusBar.style.backgroundColor = 'transparent';
                chatHeader.style.backgroundColor = 'transparent';
                chatInputArea.style.backgroundColor = 'transparent';
            }
        }; 
        reader.readAsDataURL(imageFile); 
    } 
}

function updateLockDateFromPicker() {
    const datePicker = document.getElementById('lockDatePicker');
    const textInput = document.getElementById('lockDateInput');
    
    if (datePicker.value) {
        const date = new Date(datePicker.value);
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        const month = months[date.getMonth()];
        const day = date.getDate();
        const dayOfWeek = days[date.getDay()];
        
        const englishDate = `${month} ${day}, ${dayOfWeek}`;
        textInput.value = englishDate;
        document.getElementById('lockDate').textContent = englishDate;
    }
}

function clearBackground() { document.getElementById('imageInput').value = ''; document.getElementById('phoneWrapper').style.background = ''; document.getElementById('phoneWrapper').classList.remove('has-image'); updatePairNameColor(); document.getElementById('imageInput').parentNode.querySelector('.delete-btn').classList.remove('show'); }
function clearLockBackground() { document.getElementById('lockImageInput').value = ''; document.getElementById('lockScreen').style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; document.getElementById('lockImageInput').parentNode.querySelector('.delete-btn').classList.remove('show'); }
function clearHomeBackground() { document.getElementById('homeImageInput').value = ''; document.getElementById('homeScreen').style.background = 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'; document.querySelector('#homeScreen .status-bar').style.color = '#000'; document.getElementById('homeImageInput').parentNode.querySelector('.delete-btn').classList.remove('show'); }
function clearChatBackground() { document.getElementById('chatImageInput').value = ''; const chatScreen = document.getElementById('chatScreen'); chatScreen.style.background = ''; const chatStatusBar = document.querySelector('#chatScreen .status-bar'); const chatHeader = document.querySelector('#chatScreen .chat-header'); const chatInputArea = document.querySelector('#chatScreen .chat-input-area'); chatStatusBar.style.backgroundColor = '#b2c7da'; chatHeader.style.backgroundColor = '#b2c7da'; chatInputArea.style.backgroundColor = '#b2c7da'; document.getElementById('chatImageInput').parentNode.querySelector('.delete-btn').classList.remove('show'); }
function clearProfileImage() { document.getElementById('profileImageInput').value = ''; document.getElementById('profilePic').textContent = '🐱'; document.getElementById('profileImageInput').parentNode.querySelector('.delete-btn').classList.remove('show'); }
function clearAlbumArt() { document.getElementById('albumArtInput').value = ''; currentAlbumArt = null; renderMusicWidget(); document.getElementById('albumArtInput').parentNode.querySelector('.delete-btn').classList.remove('show'); }

function setHomeBackgroundFromUrl(url, color) { 
    const homeScreen = document.getElementById('homeScreen'); 
    if (url) { 
        homeScreen.style.setProperty('background', `url('${url}') center/cover no-repeat`, 'important'); 
    } else if (color) { 
        homeScreen.style.background = color; 
        try { 
            const rgb = color.match(/\d+/g); 
            if (rgb) { 
                const brightness = (parseInt(rgb[0])*299 + parseInt(rgb[1])*587 + parseInt(rgb[2])*114) / 1000; 
                document.querySelector('#homeScreen .status-bar').style.color = brightness > 128 ? '#000' : '#fff'; 
                // 하단 독 아이콘 색상도 변경
                const dockApps = document.querySelectorAll('.dock-app');
                const iconColor = brightness > 128 ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)';
                dockApps.forEach(app => app.style.color = iconColor);
            } 
        } catch(e) { 
            document.querySelector('#homeScreen .status-bar').style.color = '#fff'; 
            const dockApps = document.querySelectorAll('.dock-app');
            dockApps.forEach(app => app.style.color = 'rgba(255, 255, 255, 0.8)');
        } 
    } 
}

function setHomePreset(imageUrl) { setHomeBackgroundFromUrl(imageUrl, null); const presetColorMap = { '0FBgjgT': '#333333', 'TPLl0Xq': '#cccccc', 'EGGtUkr': '#007AFF', 'isOfd1P': '#34C759', 'MUYgJz3': '#FF2D92', 'F4Hh6DF': '#FFD700', 'kwTQ8DJ': '#E5E5E7', 'jcctG4I': '#64D2FF', '4dWZg52': '#30D158', '3Pw8RBy': '#FF69B4' }; const key = imageUrl.split('/').pop().split('.')[0]; setupHomeApps(document.getElementById('commandInput').value, presetColorMap[key] || '#888888'); }
function generatePalette(hex) { if (!hex || !hex.startsWith('#')) return Array(12).fill('rgba(128, 128, 128, 0.5)'); let r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16); if(isNaN(r)) return Array(12).fill('rgba(128, 128, 128, 0.5)'); const palette = []; for (let i = 0; i < 12; i++) { const factor = 0.5 + (Math.random() * 0.5); const alpha = 0.5 + (Math.random() * 0.3); palette.push(`rgba(${Math.min(255, r*factor)}, ${Math.min(255, g*factor)}, ${Math.min(255, b*factor)}, ${alpha})`); } return palette; }
function setupHomeApps(command, baseColor) { const appGrid = document.getElementById('appGrid'); appGrid.innerHTML = ''; const matches = command.match(/\[(.*?)\]/g); if (!matches || matches.length < 3) return; const homeApps = matches[1].slice(1, -1); const appNames = matches[2].slice(1, -1); const appEmojis = homeApps.split(' ').filter(e => e.trim()); const appNameList = appNames.split(' ').filter(n => n.trim()); const palette = generatePalette(baseColor || '#888888'); for (let i = 0; i < Math.min(appEmojis.length, appNameList.length); i++) { const appDiv = document.createElement('div'); appDiv.className = 'home-app'; const randomColor = palette[Math.floor(Math.random() * palette.length)]; appDiv.innerHTML = `<div class="home-app-icon" style="background-color: ${randomColor};">${appEmojis[i]}</div><div class="home-app-name">${appNameList[i]}</div>`; appGrid.appendChild(appDiv); } }
