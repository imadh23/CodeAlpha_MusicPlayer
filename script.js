/**
 * Aether Player - Core Application Script
 * Features: Playback controls, playlist drawer, shuffle, loop, real-time volume slider, responsive progress seek, animated equalizer, theme toggle
 */

// ==========================================================================
// Track Database (Lightweight Royalty-Free Tracks from SoundHelix)
// ==========================================================================
const trackList = [
    {
        name: "Inspiring Acoustic",
        artist: "SoundHelix Band",
        cover: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=300&q=80",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        duration: "6:12"
    },
    {
        name: "Chill Ambient Waves",
        artist: "Atmosphere Project",
        cover: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=300&q=80",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        duration: "7:05"
    },
    {
        name: "Electro Beat Horizon",
        artist: "Synthesizer Lab",
        cover: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=300&q=80",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        duration: "5:02"
    },
    {
        name: "Sunset Guitar Solo",
        artist: "String Resonance",
        cover: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=300&q=80",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
        duration: "5:38"
    }
];

// ==========================================================================
// Application State Variables
// ==========================================================================
let trackIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let previousVolume = 0.70;

// ==========================================================================
// DOM Elements Selection
// ==========================================================================
const audioPlayer = document.getElementById("audio-player");
const albumArt = document.getElementById("album-art");
const trackTitle = document.getElementById("track-title");
const trackArtist = document.getElementById("track-artist");
const equalizer = document.getElementById("equalizer");

// Slider Elements
const currentTimeText = document.getElementById("current-time");
const totalDurationText = document.getElementById("total-duration");
const progressBar = document.getElementById("progress-bar");
const volumeBar = document.getElementById("volume-bar");

// Controls Elements
const playBtn = document.getElementById("play-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const shuffleBtn = document.getElementById("shuffle-btn");
const repeatBtn = document.getElementById("repeat-btn");
const muteBtn = document.getElementById("mute-btn");

// Playlist Drawer Elements
const playlistDrawer = document.getElementById("playlist-drawer");
const playlistToggle = document.getElementById("playlist-toggle");
const playlistClose = document.getElementById("playlist-close");
const playlistQueue = document.getElementById("playlist-queue");
const themeToggle = document.getElementById("theme-toggle");

// ==========================================================================
// Initialization
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    loadTrack(trackIndex);
    renderPlaylist();
    setupEventListeners();
});

// Setup Initial Theme
function initTheme() {
    const savedTheme = localStorage.getItem("player-theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
}

// ==========================================================================
// Audio Playback & Track Management
// ==========================================================================
function loadTrack(index) {
    trackIndex = index;
    const track = trackList[trackIndex];
    
    // Set Audio Sources
    audioPlayer.src = track.audio;
    audioPlayer.load();

    // Set Text Info
    trackTitle.textContent = track.name;
    trackArtist.textContent = track.artist;
    albumArt.src = track.cover;
    
    // Reset Slider Values
    progressBar.value = 0;
    currentTimeText.textContent = "0:00";
    totalDurationText.textContent = track.duration;

    // Update active state in Drawer Queue
    updatePlaylistActiveItem();
}

function playTrack() {
    isPlaying = true;
    audioPlayer.play();
    
    // UI Update
    playBtn.querySelector("i").className = "fa-solid fa-pause";
    albumArt.classList.add("playing");
    equalizer.classList.add("playing");
}

function pauseTrack() {
    isPlaying = false;
    audioPlayer.pause();
    
    // UI Update
    playBtn.querySelector("i").className = "fa-solid fa-play";
    albumArt.classList.remove("playing");
    equalizer.classList.remove("playing");
}

function playPause() {
    if (isPlaying) {
        pauseTrack();
    } else {
        playTrack();
    }
}

function nextTrack() {
    if (isShuffle) {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * trackList.length);
        } while (newIndex === trackIndex && trackList.length > 1);
        trackIndex = newIndex;
    } else {
        trackIndex = (trackIndex + 1) % trackList.length;
    }
    
    loadTrack(trackIndex);
    playTrack();
}

function prevTrack() {
    trackIndex = (trackIndex - 1 + trackList.length) % trackList.length;
    loadTrack(trackIndex);
    playTrack();
}

// ==========================================================================
// Seek Sliders & Progress Formats
// ==========================================================================
function updateProgress(e) {
    if (!audioPlayer.duration) return;

    const current = audioPlayer.currentTime;
    const duration = audioPlayer.duration;
    
    // Update Progress Slider value
    const progressPercent = (current / duration) * 100;
    progressBar.value = progressPercent;
    
    // Format Display Texts
    currentTimeText.textContent = formatTime(current);
    totalDurationText.textContent = formatTime(duration);
}

function setProgress(e) {
    if (!audioPlayer.duration) return;
    
    const clickPercent = e.target.value;
    const newTime = (clickPercent / 100) * audioPlayer.duration;
    audioPlayer.currentTime = newTime;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    if (secs < 10) secs = "0" + secs;
    return `${mins}:${secs}`;
}

// ==========================================================================
// Volume Controls
// ==========================================================================
function setVolume(e) {
    const vol = e.target.value / 100;
    audioPlayer.volume = vol;
    previousVolume = vol;
    updateVolumeIcon(vol);
}

function toggleMute() {
    if (audioPlayer.volume > 0) {
        previousVolume = audioPlayer.volume;
        audioPlayer.volume = 0;
        volumeBar.value = 0;
        muteBtn.querySelector("i").className = "fa-solid fa-volume-xmark";
    } else {
        audioPlayer.volume = previousVolume;
        volumeBar.value = previousVolume * 100;
        updateVolumeIcon(previousVolume);
    }
}

function updateVolumeIcon(vol) {
    const icon = muteBtn.querySelector("i");
    if (vol === 0) {
        icon.className = "fa-solid fa-volume-xmark";
    } else if (vol < 0.4) {
        icon.className = "fa-solid fa-volume-low";
    } else {
        icon.className = "fa-solid fa-volume-high";
    }
}

// ==========================================================================
// Shuffle & Repeat Modes
// ==========================================================================
function toggleShuffle() {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle("active", isShuffle);
}

function toggleRepeat() {
    isRepeat = !isRepeat;
    repeatBtn.classList.toggle("active", isRepeat);
}

// ==========================================================================
// Playlist Queue Drawer Implementation
// ==========================================================================
function renderPlaylist() {
    playlistQueue.innerHTML = "";
    
    trackList.forEach((track, index) => {
        const item = document.createElement("div");
        item.className = `queue-item ${index === trackIndex ? 'active' : ''}`;
        item.setAttribute("data-track-index", index);

        item.innerHTML = `
            <img src="${track.cover}" alt="Track artwork" class="queue-art">
            <div class="queue-details">
                <h4 class="queue-title">${track.name}</h4>
                <p class="queue-artist">${track.artist}</p>
            </div>
            <span class="queue-duration">${track.duration}</span>
        `;

        item.addEventListener("click", () => {
            loadTrack(index);
            playTrack();
            // Automatically close drawer on mobile for neat flow
            if (window.innerWidth < 450) {
                playlistDrawer.classList.remove("active");
            }
        });

        playlistQueue.appendChild(item);
    });
}

function updatePlaylistActiveItem() {
    const queueItems = playlistQueue.querySelectorAll(".queue-item");
    queueItems.forEach((item, index) => {
        if (index === trackIndex) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });
}

// ==========================================================================
// Event Listeners Setup
// ==========================================================================
function setupEventListeners() {
    // Playback Buttons
    playBtn.addEventListener("click", playPause);
    nextBtn.addEventListener("click", nextTrack);
    prevBtn.addEventListener("click", prevTrack);
    
    // Sliders
    audioPlayer.addEventListener("timeupdate", updateProgress);
    audioPlayer.addEventListener("ended", () => {
        if (isRepeat) {
            audioPlayer.currentTime = 0;
            playTrack();
        } else {
            nextTrack();
        }
    });
    
    progressBar.addEventListener("input", setProgress);
    volumeBar.addEventListener("input", setVolume);
    muteBtn.addEventListener("click", toggleMute);
    
    // Modes
    shuffleBtn.addEventListener("click", toggleShuffle);
    repeatBtn.addEventListener("click", toggleRepeat);

    // Drawer Toggles
    playlistToggle.addEventListener("click", () => {
        playlistDrawer.classList.add("active");
    });
    
    playlistClose.addEventListener("click", () => {
        playlistDrawer.classList.remove("active");
    });

    // Theme Toggle
    themeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "light" ? "dark" : "light";
        
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("player-theme", newTheme);
    });
}
