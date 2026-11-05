(function() {

  const PLAYLIST = [
    { url: 'music/basshunter dota.mp3', name: 'DotA', artist: 'Basshunter', photo: 'photo/69868953.jpg' },
    { url: 'music/Amyst U and I.mp3', name: 'U and I', artist: 'Amyst', photo: 'photo/323232.jpg' },
    { url: 'music/Melanie Martinez - GUTTER.mp3', name: 'GUTTER', artist: 'Melanie Martinez', photo: 'photo/890758.jpg' },
    { url: 'music/Temper City - Self Aware (LUM!X Remix).mp3', name: 'Self Aware (LUM!X Remix)', artist: 'Temper City', photo: 'photo/6666443343345.jpg' },
    { url: 'music/lil peep - benz truck (prod. smokeasac).mp3', name: 'benz truck (prod. smokeasac)', artist: 'lil peep', photo: 'photo/fdfdfd.jpg' },
    { url: 'music/MONTAGEM DOMER.mp3', name: 'MONTAGEM DOMER', artist: 'DJ Fallthox, Paizo, DJ LXILL', photo: 'photo/1105.mp4' },
    { url: 'music/Farben.mp3', name: 'Farben (TAK TIK Mix)', artist: 'Orange Sector', photo: 'photo/543354534.jpg' },
    { url: 'music/prostodichebanayakaktakto.mp3', name: 'Disney princess', artist: 'Melanie Martinez, Clouded', photo: 'photo/88888.jpg' }
  ];

  const PHOTO_URL = 'photo/16661421534.jpg';
  const START_DATE = new Date(2023, 0, 1);

  let currentIndex = 0;
  let isPlaying = false;
  let photoAnimationLock = false;

  const welcomeScreen = document.getElementById('welcomeScreen');
  const welcomeBtn = document.getElementById('welcomeBtn');
  const mainContent = document.getElementById('mainContent');

  const audioPlayer = document.getElementById('audioPlayer');
  const welcomeSound = document.getElementById('welcomeSound');
  const playBtn = document.getElementById('playBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const progressBar = document.getElementById('progressBar');
  const progressContainer = document.getElementById('progressContainer');
  const currentTimeEl = document.getElementById('currentTime');
  const totalTimeEl = document.getElementById('totalTime');
  const trackTitleEl = document.getElementById('trackTitle');
  const trackArtistEl = document.getElementById('trackArtist');
  const trackCounterEl = document.getElementById('trackCounter');
  const photoImage = document.getElementById('photoImage');
  const photoVideo = document.getElementById('photoVideo');
  const photoFrame = document.getElementById('photoFrame');
  const volumeSlider = document.getElementById('volumeSlider');
  const volumeDown = document.getElementById('volumeDown');
  const volumeUp = document.getElementById('volumeUp');
  const daysTogetherEl = document.getElementById('daysTogether');
  const secretBtn = document.getElementById('secretBtn');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose = document.getElementById('modalClose');
  const modalText = document.getElementById('modalText');
  const trackInfoEl = document.querySelector('.track-info');

  audioPlayer.volume = parseFloat(volumeSlider.value);
  if (welcomeSound) welcomeSound.volume = 0.8;

  

  // Приветственный экран
  document.body.style.overflow = 'hidden';

  welcomeBtn.addEventListener('click', function() {
    if (welcomeSound) {
      welcomeSound.currentTime = 0;
      welcomeSound.play().catch(function() {});
    }
    this.style.transform = 'scale(0.92)';
    var self = this;
    setTimeout(function() { self.style.transform = ''; }, 200);
    welcomeScreen.classList.add('hidden');
    setTimeout(function() { mainContent.classList.add('visible'); }, 400);
    setTimeout(function() {
      welcomeScreen.style.display = 'none';
      document.body.style.overflow = 'auto';
    }, 1000);
  });

  // Громкость
  volumeSlider.addEventListener('input', function() {
    audioPlayer.volume = parseFloat(this.value);
  });
  volumeDown.addEventListener('click', function() {
    audioPlayer.volume = Math.max(0, audioPlayer.volume - 0.1);
    volumeSlider.value = audioPlayer.volume;
  });
  volumeUp.addEventListener('click', function() {
    audioPlayer.volume = Math.min(1, audioPlayer.volume + 0.1);
    volumeSlider.value = audioPlayer.volume;
  });

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    var min = Math.floor(seconds / 60);
    var sec = Math.floor(seconds % 60);
    return min + ':' + (sec < 10 ? '0' : '') + sec;
  }

  // ИСПРАВЛЕННАЯ ФУНКЦИЯ ДЛЯ ФОТО И ВИДЕО
  function updatePhoto(animate) {
    if (animate === undefined) animate = true;
    var track = PLAYLIST[currentIndex];
    var photoSrc = (track && track.photo) ? track.photo : PHOTO_URL;

    var oldPlaceholder = photoFrame.querySelector('.photo-placeholder');
    if (oldPlaceholder) oldPlaceholder.remove();

    if (!photoSrc) {
      photoImage.style.display = 'none';
      photoVideo.style.display = 'none';
      return;
    }

    var isVideo = photoSrc.endsWith('.mp4') || photoSrc.endsWith('.webm');

    function applyNewMedia() {
      if (isVideo) {
        photoImage.style.display = 'none';
        photoVideo.style.display = 'block';
        photoVideo.src = photoSrc;
        
        // ИСПРАВЛЕНИЕ БАГА: Запускаем видео ТОЛЬКО если музыка играет
        if (isPlaying) {
          photoVideo.play().catch(function() {});
        } else {
          photoVideo.pause();
          photoVideo.currentTime = 0; // Отматываем на начало (красивый первый кадр)
        }

        photoVideo.classList.remove('photo-fade-out');
        void photoVideo.offsetWidth;
        photoVideo.classList.add('photo-fade-in');
        photoAnimationLock = false;
      } else {
        photoVideo.style.display = 'none';
        photoVideo.pause();
        photoImage.style.display = 'block';
        photoImage.src = photoSrc;
        photoImage.onload = function() {
          photoImage.classList.remove('photo-fade-out');
          void photoImage.offsetWidth;
          photoImage.classList.add('photo-fade-in');
          photoAnimationLock = false;
        };
        photoImage.onerror = function() {
          photoImage.style.display = 'none';
          photoImage.classList.remove('photo-fade-out', 'photo-fade-in');
          var prev = photoFrame.querySelector('.photo-placeholder');
          if (prev) prev.remove();
          var placeholder = document.createElement('div');
          placeholder.className = 'photo-placeholder';
          placeholder.innerHTML = '<span>🖼️✨</span><p></p>';
          photoFrame.appendChild(placeholder);
          photoAnimationLock = false;
        };
      }
    }

    var currentSrc = isVideo ? photoVideo.getAttribute('src') : photoImage.getAttribute('src');
    if (!animate || currentSrc === photoSrc) {
      photoImage.classList.remove('photo-fade-out', 'photo-fade-in');
      photoVideo.classList.remove('photo-fade-out', 'photo-fade-in');
      applyNewMedia();
      return;
    }

    if (photoAnimationLock) { applyNewMedia(); return; }
    photoAnimationLock = true;

    photoFrame.classList.remove('photo-switching');
    void photoFrame.offsetWidth;
    photoFrame.classList.add('photo-switching');

    var activeMedia = isVideo ? photoVideo : photoImage;
    activeMedia.classList.remove('photo-fade-in');
    activeMedia.classList.add('photo-fade-out');

    var onFadeOutEnd = function() {
      activeMedia.removeEventListener('animationend', onFadeOutEnd);
      applyNewMedia();
    };
    activeMedia.addEventListener('animationend', onFadeOutEnd);

    setTimeout(function() {
      if (photoAnimationLock) {
        activeMedia.removeEventListener('animationend', onFadeOutEnd);
        applyNewMedia();
      }
    }, 500);
  }

  function updateTrackInfo() {
    if (trackInfoEl) trackInfoEl.classList.add('updating');
    setTimeout(function() {
      var track = PLAYLIST[currentIndex];
      trackTitleEl.textContent = track.name;
      trackArtistEl.textContent = track.artist;
      trackCounterEl.textContent = (currentIndex + 1) + ' / ' + PLAYLIST.length;
      totalTimeEl.textContent = formatTime(audioPlayer.duration || 0);
      currentTimeEl.textContent = formatTime(audioPlayer.currentTime || 0);
      if (trackInfoEl) trackInfoEl.classList.remove('updating');
    }, 300);
  }

  function preloadNextTrack() {
    if (PLAYLIST.length < 2) return;
    var nextIndex = (currentIndex + 1) % PLAYLIST.length;
    var preloadAudio = new Audio();
    preloadAudio.preload = 'auto';
    preloadAudio.src = PLAYLIST[nextIndex].url;
  }

  function loadTrack(index, animatePhoto) {
    if (animatePhoto === undefined) animatePhoto = true;
    if (PLAYLIST.length === 0) return;
    currentIndex = index;
    var track = PLAYLIST[currentIndex];
    audioPlayer.src = track.url;
    audioPlayer.load();
    updateTrackInfo();
    updatePhoto(animatePhoto);
    if (isPlaying) {
      audioPlayer.play().catch(function() {
        isPlaying = false;
        playBtn.textContent = '▶️';
      });
    } else {
      photoVideo.pause();
    }
    preloadNextTrack();
  }

  function nextTrack() {
    if (PLAYLIST.length === 0) return;
    currentIndex = (currentIndex + 1) % PLAYLIST.length;
    loadTrack(currentIndex, true);
  }

  function prevTrack() {
    if (PLAYLIST.length === 0) return;
    currentIndex = (currentIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    loadTrack(currentIndex, true);
  }

  function togglePlay() {
    if (PLAYLIST.length === 0) { alert('Плейлист пуст'); return; }
    if (isPlaying) {
      audioPlayer.pause();
    } else {
      audioPlayer.play().catch(function() {
        alert('Ошибка воспроизведения');
      });
    }
  }

  if (PHOTO_URL) {
    photoImage.src = PHOTO_URL;
    photoImage.onerror = function() {
      this.style.display = 'none';
      var placeholder = document.createElement('div');
      placeholder.className = 'photo-placeholder';
      placeholder.innerHTML = '<span>🖼️✨</span><p></p>';
      photoFrame.appendChild(placeholder);
    };
  }

  audioPlayer.addEventListener('timeupdate', function() {
    if (audioPlayer.duration) {
      var progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      progressBar.style.width = progress + '%';
      currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    }
  });

  audioPlayer.addEventListener('loadedmetadata', function() {
    totalTimeEl.textContent = formatTime(audioPlayer.duration);
  });

  audioPlayer.addEventListener('ended', nextTrack);
  
  // Связка кнопки Play и видео
  audioPlayer.addEventListener('play', function() {
    isPlaying = true;
    playBtn.textContent = '⏸️';
    if (photoVideo.style.display === 'block') {
      photoVideo.play().catch(function() {});
    }
  });
  
  audioPlayer.addEventListener('pause', function() {
    isPlaying = false;
    playBtn.textContent = '▶️';
    if (photoVideo.style.display === 'block') {
      photoVideo.pause();
    }
  });

  progressContainer.addEventListener('click', function(e) {
    if (!audioPlayer.duration || PLAYLIST.length === 0) return;
    var rect = progressContainer.getBoundingClientRect();
    var percent = (e.clientX - rect.left) / rect.width;
    audioPlayer.currentTime = percent * audioPlayer.duration;
  });

  playBtn.addEventListener('click', togglePlay);
  nextBtn.addEventListener('click', nextTrack);
  prevBtn.addEventListener('click', prevTrack);

  // Секретная кнопка
  var SECRET_MESSAGES = [
    'Ты самое лучшее, что случалось со мной , я рад что мы вместе. 💜',
    'Я люблю твою улыбку. Она моё солнце как и ты. ☀️',
    'Спасибо, что ты есть. Каждый день с тобой подарок.',
    'Ты красивее всех звёзд на этом небе. ✨',
    'Мне нравится, как ты смеешься. Это мой любимый звук.',
    'Алиса , я тебя люблю .',
    'Ты моя вселенная. 🌌'
  ];
  var messageIndex = 0;

  if (secretBtn) {
    secretBtn.addEventListener('click', function() {
      modalText.textContent = SECRET_MESSAGES[messageIndex];
      messageIndex = (messageIndex + 1) % SECRET_MESSAGES.length;
      modalOverlay.classList.add('active');
    });
  }
  if (modalClose) {
    modalClose.addEventListener('click', function() {
      modalOverlay.classList.remove('active');
    });
  }
  if (modalOverlay) {
    modalOverlay.addEventListener('click', function(e) {
      if (e.target === modalOverlay) modalOverlay.classList.remove('active');
    });
  }

  // Долгое нажатие на фото
  var longPressTimer;
  if (photoFrame) {
    photoFrame.addEventListener('touchstart', function() {
      longPressTimer = setTimeout(function() {
        if (navigator.vibrate) navigator.vibrate(50);
        var heart = document.createElement('div');
        heart.textContent = '💜';
        heart.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(0);font-size:5rem;pointer-events:none;animation:heartBurst 1s ease forwards;z-index:5;';
        photoFrame.appendChild(heart);
        setTimeout(function() { heart.remove(); }, 1000);
      }, 800);
    });
    photoFrame.addEventListener('touchend', function() { clearTimeout(longPressTimer); });
    photoFrame.addEventListener('touchmove', function() { clearTimeout(longPressTimer); });
  }

  // СТАРТ
  if (PLAYLIST.length > 0) {
    loadTrack(0, false);
  }

})();
