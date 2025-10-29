// DOM Elements
const webcamElement = document.getElementById('webcam');
const canvasElement = document.getElementById('detection-canvas');
const ctx = canvasElement.getContext('2d');
const startButton = document.getElementById('start-btn');
const stopButton = document.getElementById('stop-btn');
const angleLabelElement = document.getElementById('angle-value');
const postureFeedbackElement = document.getElementById('posture-feedback');
const repsCountElement = document.getElementById('reps-count');
const durationTimerElement = document.getElementById('duration-timer');

// Exercise Details Elements
const exerciseTitle = document.getElementById('exercise-title');
const exerciseImage = document.getElementById('exercise-image');
const exerciseDescription = document.getElementById('exercise-description');
const formTipsList = document.getElementById('form-tips-list');
const exerciseVariations = document.getElementById('exercise-variations');

// Global variables
let stream = null;
let isRunning = false;
let startTime = null;
let timerInterval = null;
let repsCount = 0;
let lastPoseState = null;
let currentAngle = 0;

// Simulated joint positions (in a real app, these would come from a pose detection model)
const joints = {
    shoulders: { x: 0, y: 0 },
    elbows: { x: 0, y: 0 },
    wrists: { x: 0, y: 0 },
    hips: { x: 0, y: 0 },
    knees: { x: 0, y: 0 },
    ankles: { x: 0, y: 0 }
};

// Event Listeners
startButton.addEventListener('click', startExercise);
stopButton.addEventListener('click', stopExercise);

// Initialize canvas size
function initCanvas() {
    canvasElement.width = webcamElement.videoWidth;
    canvasElement.height = webcamElement.videoHeight;
}

// Start exercise tracking
async function startExercise() {
    try {
        // Access webcam
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 640 },
                height: { ideal: 480 }
            } 
        });
        
        webcamElement.srcObject = stream;
        
        // Wait for video to be ready
        webcamElement.onloadedmetadata = () => {
            initCanvas();
            isRunning = true;
            startButton.disabled = true;
            stopButton.disabled = false;
            
            // Start timer
            startTime = new Date();
            timerInterval = setInterval(updateTimer, 1000);
            
            // Start detection loop
            requestAnimationFrame(detectPose);
            
            // Update UI
            postureFeedbackElement.textContent = 'Starting detection...';
            postureFeedbackElement.className = 'feedback-text';
        };
    } catch (error) {
        console.error('Error accessing webcam:', error);
        postureFeedbackElement.textContent = 'Error accessing webcam';
        postureFeedbackElement.className = 'feedback-text feedback-incorrect';
    }
}

// Stop exercise tracking
function stopExercise() {
    isRunning = false;
    
    // Stop webcam
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        webcamElement.srcObject = null;
    }
    
    // Clear timer
    clearInterval(timerInterval);
    
    // Reset UI
    startButton.disabled = false;
    stopButton.disabled = true;
    postureFeedbackElement.textContent = 'Detection stopped';
    postureFeedbackElement.className = 'feedback-text';
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
}

// Update timer display
function updateTimer() {
    if (!startTime) return;
    
    const currentTime = new Date();
    const elapsedTime = Math.floor((currentTime - startTime) / 1000);
    
    const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
    const seconds = (elapsedTime % 60).toString().padStart(2, '0');
    
    durationTimerElement.textContent = `${minutes}:${seconds}`;
}

// Simulate pose detection (in a real app, this would use a pose detection model)
function detectPose() {
    if (!isRunning) return;
    
    // Draw video frame on canvas
    ctx.drawImage(webcamElement, 0, 0, canvasElement.width, canvasElement.height);
    
    // Simulate joint detection
    simulateJointDetection();
    
    // Draw pose skeleton
    drawSkeleton();
    
    // Calculate and display angle
    calculateAngle();
    
    // Check exercise form and count reps
    checkExerciseForm();
    
    // Continue detection loop
    requestAnimationFrame(detectPose);
}

// Simulate joint detection (in a real app, this would use a pose detection model)
function simulateJointDetection() {
    const centerX = canvasElement.width / 2;
    const centerY = canvasElement.height / 2;
    const time = Date.now() / 1000;
    
    // Simulate shoulder movement
    joints.shoulders.x = centerX;
    joints.shoulders.y = centerY - 80 + Math.sin(time) * 10;
    
    // Simulate elbow movement
    joints.elbows.x = centerX + 60;
    joints.elbows.y = centerY - 40 + Math.sin(time * 1.5) * 20;
    
    // Simulate wrist movement
    joints.wrists.x = centerX + 100;
    joints.wrists.y = centerY + Math.sin(time * 2) * 30;
    
    // Simulate hip movement
    joints.hips.x = centerX;
    joints.hips.y = centerY + 50;
    
    // Simulate knee movement
    joints.knees.x = centerX + 30;
    joints.knees.y = centerY + 120 + Math.sin(time) * 10;
    
    // Simulate ankle movement
    joints.ankles.x = centerX + 60;
    joints.ankles.y = centerY + 180;
}

// Draw skeleton on canvas
function drawSkeleton() {
    // Set line style
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    
    // Draw lines connecting joints
    ctx.beginPath();
    
    // Upper body
    ctx.moveTo(joints.shoulders.x, joints.shoulders.y);
    ctx.lineTo(joints.elbows.x, joints.elbows.y);
    ctx.lineTo(joints.wrists.x, joints.wrists.y);
    
    // Lower body
    ctx.moveTo(joints.shoulders.x, joints.shoulders.y);
    ctx.lineTo(joints.hips.x, joints.hips.y);
    ctx.lineTo(joints.knees.x, joints.knees.y);
    ctx.lineTo(joints.ankles.x, joints.ankles.y);
    
    ctx.stroke();
    
    // Draw joints
    ctx.fillStyle = 'green';
    
    // Draw each joint as a circle
    Object.values(joints).forEach(joint => {
        ctx.beginPath();
        ctx.arc(joint.x, joint.y, 8, 0, 2 * Math.PI);
        ctx.fill();
    });
}

// Calculate angle between joints
function calculateAngle() {
    // Calculate angle between shoulder, elbow, and wrist
    const angle = calculateJointAngle(
        joints.shoulders.x, joints.shoulders.y,
        joints.elbows.x, joints.elbows.y,
        joints.wrists.x, joints.wrists.y
    );
    
    currentAngle = Math.round(angle);
    angleLabelElement.textContent = `${currentAngle}°`;
}

// Calculate angle between three points
function calculateJointAngle(x1, y1, x2, y2, x3, y3) {
    const a = Math.sqrt(Math.pow(x2 - x3, 2) + Math.pow(y2 - y3, 2));
    const b = Math.sqrt(Math.pow(x1 - x3, 2) + Math.pow(y1 - y3, 2));
    const c = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    
    // Law of cosines
    const angleRad = Math.acos((a*a + c*c - b*b) / (2 * a * c));
    return angleRad * (180 / Math.PI); // Convert to degrees
}

// Check exercise form and count reps
function checkExerciseForm() {
    // For push-up, we'll use the elbow angle
    // Proper form: angle < 90 at bottom, > 160 at top
    
    let poseState = null;
    
    if (currentAngle < 90) {
        poseState = 'down';
        postureFeedbackElement.textContent = 'Good form - Push Up Bottom Position';
        postureFeedbackElement.className = 'feedback-text feedback-correct';
    } else if (currentAngle > 160) {
        poseState = 'up';
        postureFeedbackElement.textContent = 'Good form - Push Up Top Position';
        postureFeedbackElement.className = 'feedback-text feedback-correct';
    } else {
        postureFeedbackElement.textContent = 'Continue your movement';
        postureFeedbackElement.className = 'feedback-text';
    }
    
    // Count rep when transitioning from down to up
    if (lastPoseState === 'down' && poseState === 'up') {
        repsCount++;
        repsCountElement.textContent = repsCount;
    }
    
    lastPoseState = poseState;
}

// Initialize UI
function initUI() {
    // Set initial values
    repsCountElement.textContent = '0';
    durationTimerElement.textContent = '00:00';
    angleLabelElement.textContent = '0°';
    postureFeedbackElement.textContent = 'Ready to start';
}

// Exercise details data
const exerciseData = {
    'standard': {
        title: 'Standard Push Up',
        image: 'standard-pushup.svg',
        description: 'The standard push-up is a classic exercise that targets the chest, shoulders, triceps, and core.',
        tips: [
            'Keep your body in a straight line',
            'Position hands slightly wider than shoulder-width',
            'Lower until chest nearly touches the floor',
            'Push back up to starting position'
        ],
        bodyFocus: {
            arms: 60,
            chest: 95,
            core: 40
        }
    },
    'wide': {
        title: 'Wide Push Up',
        image: 'wide-pushup.svg',
        description: 'Wide push-ups place more emphasis on the chest muscles by positioning the hands wider than shoulder-width apart.',
        tips: [
            'Place hands wider than shoulder-width',
            'Keep elbows at a 45-degree angle',
            'Lower until chest nearly touches the floor',
            'Focus on squeezing chest muscles'
        ],
        bodyFocus: {
            arms: 60,
            chest: 95,
            core: 40
        }
    },
    'diamond': {
        title: 'Diamond Push Up',
        image: 'diamond-pushup.svg',
        description: 'Diamond push-ups target the triceps more intensely by positioning the hands close together in a diamond shape.',
        tips: [
            'Form a diamond shape with your thumbs and index fingers',
            'Position hands directly under your chest',
            'Keep elbows close to your body',
            'Lower until chest touches your hands'
        ],
        bodyFocus: {
            arms: 90,
            chest: 60,
            core: 50
        }
    },
    'incline': {
        title: 'Incline Push Up',
        image: 'incline-pushup.svg',
        description: 'Incline push-ups are easier than standard push-ups and are great for beginners. They place less stress on the shoulders and arms.',
        tips: [
            'Place hands on an elevated surface',
            'Keep body straight from head to heels',
            'Lower chest toward the elevated surface',
            'Push back up to starting position'
        ],
        bodyFocus: {
            arms: 50,
            chest: 75,
            core: 35
        }
    },
    'decline': {
        title: 'Decline Push Up',
        image: 'decline-pushup.svg',
        description: 'Decline push-ups are more challenging than standard push-ups and place more emphasis on the upper chest and shoulders.',
        tips: [
            'Place feet on an elevated surface',
            'Position hands on the floor at shoulder width',
            'Lower until chest nearly touches the floor',
            'Engage core throughout the movement'
        ],
        bodyFocus: {
            arms: 75,
            chest: 90,
            core: 65
        }
    }
};

// Update exercise details based on selected variation
function updateExerciseDetails(variation) {
    const data = exerciseData[variation];
    
    // Update exercise title and description
    exerciseTitle.textContent = data.title;
    exerciseDescription.textContent = data.description;
    
    // Update exercise image
    exerciseImage.src = data.image;
    exerciseImage.alt = data.title;
    
    // Update form tips
    formTipsList.innerHTML = '';
    data.tips.forEach(tip => {
        const li = document.createElement('li');
        li.textContent = tip;
        formTipsList.appendChild(li);
    });
    
    // Update body focus percentages
    document.getElementById('arms-progress').style.width = data.bodyFocus.arms + '%';
    document.getElementById('arms-progress').textContent = data.bodyFocus.arms + '%';
    
    document.getElementById('chest-progress').style.width = data.bodyFocus.chest + '%';
    document.getElementById('chest-progress').textContent = data.bodyFocus.chest + '%';
    
    document.getElementById('core-progress').style.width = data.bodyFocus.core + '%';
    document.getElementById('core-progress').textContent = data.bodyFocus.core + '%';
}

// Event listener for exercise variation change
exerciseVariations.addEventListener('change', function() {
    updateExerciseDetails(this.value);
});

// Initialize the application
window.addEventListener('load', function() {
    initUI();
    updateExerciseDetails('standard');
});