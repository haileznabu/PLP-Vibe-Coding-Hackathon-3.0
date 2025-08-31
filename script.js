// Sample flashcards data
const flashcardsData = [
  {
    id: 1,
    question: "What is the primary function of mitochondria in cells?",
    answer:
      "Mitochondria are the powerhouses of the cell, responsible for producing ATP (energy) through cellular respiration.",
    difficulty: "medium",
    subject: "Biology",
  },
  {
    id: 2,
    question: "Explain the process of photosynthesis.",
    answer:
      "Photosynthesis is the process by which plants convert light energy, carbon dioxide, and water into glucose and oxygen using chlorophyll.",
    difficulty: "medium",
    subject: "Biology",
  },
  {
    id: 3,
    question: "What are the main components of DNA?",
    answer:
      "DNA consists of four nucleotide bases: Adenine (A), Thymine (T), Guanine (G), and Cytosine (C), arranged in a double helix structure.",
    difficulty: "hard",
    subject: "Biology",
  },
]

// Global variables
let currentFlashcard = 0
let isFlipped = false
let userFlashcards = [...flashcardsData] // User's personal flashcard collection
let studySession = {
  correct: 0,
  incorrect: 0,
  startTime: null,
  currentStreak: 0,
}

// DOM elements
const navButtons = document.querySelectorAll(".nav-btn")
const featureSections = document.querySelectorAll(".feature-section")
const flashcard = document.getElementById("flashcard")
const questionText = document.getElementById("question-text")
const answerText = document.getElementById("answer-text")
const cardCounter = document.querySelector(".card-counter")
const prevCardBtn = document.getElementById("prevCard")
const nextCardBtn = document.getElementById("nextCard")
const generateFlashcardsBtn = document.getElementById("generateFlashcards")
const studyNotesTextarea = document.getElementById("studyNotes")
const generateMindMapBtn = document.getElementById("generateMindMap")
const topicInput = document.getElementById("topicInput")
const chatForm = document.getElementById("chatForm")
const chatInput = document.getElementById("chatInput")
const chatMessages_div = document.getElementById("chatMessages")
const mindmapCanvas = document.getElementById("mindmapCanvas")
const mindmapSvg = document.getElementById("mindmapSvg")
const mindmapPlaceholder = document.getElementById("mindmapPlaceholder")
const zoomInBtn = document.getElementById("zoomIn")
const zoomOutBtn = document.getElementById("zoomOut")
const resetZoomBtn = document.getElementById("resetZoom")
const easyBtn = document.getElementById("easyBtn")
const mediumBtn = document.getElementById("mediumBtn")
const hardBtn = document.getElementById("hardBtn")
const fullScreenBtn = document.getElementById("fullScreen") // Added full screen button

// API configuration
const API_CONFIG = {
  OPENAI_API_KEY:
    "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", // Will be set from environment
  FIREBASE_CONFIG: {
    // Firebase config
    apiKey: "AIzaSyCCO-kTflyjvsfjt5wO5sh_49RGfqiKGjM",
    authDomain: "vibe-coding-3.firebaseapp.com",
    projectId: "vibe-coding-3",
    storageBucket: "vibe-coding-3.firebasestorage.app",
    appId: "1:1063169045876:web:35620146c35d1d86a7a821",
    messagingSenderId: "1063169045876",
    measurementId: "G-D0SRJ1P5G1",
  },
}
// Function to add chat message
function addChatMessage(sender, message) {
  const messageDiv = document.createElement("div")
  messageDiv.className = `chat-message ${sender}`
  messageDiv.textContent = message
  chatMessages_div.appendChild(messageDiv)
  chatMessages_div.scrollTop = chatMessages_div.scrollHeight
}

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] AI Study Buddy initialized")

  // Set up navigation
  setupNavigation()

  // Set up flashcards
  setupFlashcards()

  // Set up chat
  setupChat()

  // Set up other features
  setupOtherFeatures()

  // Load initial flashcard
  updateFlashcard()
})

// Navigation functionality
function setupNavigation() {
  navButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const feature = this.dataset.feature
      switchFeature(feature)
    })
  })
}

function switchFeature(feature) {
  console.log(`[v0] Switching to feature: ${feature}`)

  // Update navigation buttons
  navButtons.forEach((btn) => btn.classList.remove("active"))
  document.querySelector(`[data-feature="${feature}"]`).classList.add("active")

  // Update feature sections
  featureSections.forEach((section) => section.classList.remove("active"))
  document.getElementById(feature).classList.add("active")
}

// Flashcards functionality
function setupFlashcards() {
  // Flashcard click to flip
  flashcard.addEventListener("click", flipCard)

  // Navigation buttons
  prevCardBtn.addEventListener("click", previousCard)
  nextCardBtn.addEventListener("click", nextCard)

  // Generate flashcards button
  generateFlashcardsBtn.addEventListener("click", generateFlashcards)

  // Difficulty buttons
  easyBtn.addEventListener("click", () => handleDifficultySelection("easy"))
  mediumBtn.addEventListener("click", () => handleDifficultySelection("medium"))
  hardBtn.addEventListener("click", () => handleDifficultySelection("hard"))
}

function flipCard() {
  isFlipped = !isFlipped
  flashcard.classList.toggle("flipped", isFlipped)
  console.log(`[v0] Flashcard flipped: ${isFlipped}`)
}

function updateFlashcard() {
  if (userFlashcards.length === 0) {
    showNotification("No flashcards available. Generate some first!", "warning")
    return
  }

  const card = userFlashcards[currentFlashcard]
  questionText.textContent = card.question
  answerText.textContent = card.answer
  cardCounter.textContent = `${currentFlashcard + 1} of ${userFlashcards.length}`

  // Update difficulty indicator
  updateDifficultyIndicator(card.difficulty)

  // Reset flip state
  isFlipped = false
  flashcard.classList.remove("flipped")

  updateNavigationButtons()

  console.log(`[v0] Updated to flashcard ${currentFlashcard + 1}`)
}

function updateNavigationButtons() {
  if (userFlashcards.length <= 1) {
    prevCardBtn.disabled = true
    nextCardBtn.disabled = true
    return
  }

  // Enable/disable previous button
  prevCardBtn.disabled = currentFlashcard === 0

  // Enable/disable next button
  nextCardBtn.disabled = currentFlashcard === userFlashcards.length - 1
}

function nextCard() {
  if (currentFlashcard < userFlashcards.length - 1) {
    currentFlashcard++
    updateFlashcard()
  }
}

function previousCard() {
  if (currentFlashcard > 0) {
    currentFlashcard--
    updateFlashcard()
  }
}

// Helper function to calculate text width
function getTextWidth(text, fontSize = 12) {
  const avgCharWidth = fontSize * 0.65 // Slightly increased for better accuracy
  return text.length * avgCharWidth + 20 // Added padding
}

// Helper function to wrap text into multiple lines
function wrapText(text, maxWidth, fontSize = 12) {
  const words = text.split(" ")
  const lines = []
  let currentLine = ""

  const effectiveMaxWidth = maxWidth - 30 // More padding for text

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const testWidth = getTextWidth(testLine, fontSize)

    if (testWidth <= effectiveMaxWidth) {
      currentLine = testLine
    } else {
      if (currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        if (getTextWidth(word, fontSize) > effectiveMaxWidth) {
          // Break long word into smaller parts
          const chars = word.split("")
          let partialWord = ""
          for (const char of chars) {
            if (getTextWidth(partialWord + char, fontSize) <= effectiveMaxWidth) {
              partialWord += char
            } else {
              if (partialWord) lines.push(partialWord)
              partialWord = char
            }
          }
          if (partialWord) currentLine = partialWord
        } else {
          lines.push(word)
        }
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

// Helper function to create multi-line SVG text
function createMultiLineText(svg, lines, x, y, fontSize, fill, fontWeight = "normal") {
  const textGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
  const lineHeight = fontSize * 1.2
  const startY = y - ((lines.length - 1) * lineHeight) / 2

  lines.forEach((line, index) => {
    const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text")
    textElement.setAttribute("text-anchor", "middle")
    textElement.setAttribute("x", x)
    textElement.setAttribute("y", startY + index * lineHeight)
    textElement.setAttribute("fill", fill)
    textElement.setAttribute("font-size", fontSize)
    textElement.setAttribute("font-weight", fontWeight)
    textElement.textContent = line
    textGroup.appendChild(textElement)
  })

  return textGroup
}

function renderMindMap(data) {
  const canvas = document.getElementById("mindmapCanvas")
  const svg = document.getElementById("mindmapSvg")
  const placeholder = document.getElementById("mindmapPlaceholder")

  // Hide placeholder and show SVG
  placeholder.style.display = "none"
  svg.style.display = "block"

  const svgWidth = 1000
  const svgHeight = 800
  svg.setAttribute("width", svgWidth)
  svg.setAttribute("height", svgHeight)
  svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`)

  // Clear existing content
  svg.innerHTML = `
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" 
              refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#8b5cf6" />
      </marker>
      <marker id="childArrow" markerWidth="8" markerHeight="6" 
              refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#10b981" />
      </marker>
    </defs>
  `

  const centerX = svgWidth / 2
  const centerY = svgHeight / 2
  const branchRadius = 180 // Reduced from 200 to fit better

  // Create central node
  const centralGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
  centralGroup.setAttribute("class", "mind-node central-node")
  centralGroup.setAttribute("transform", `translate(${centerX}, ${centerY})`)

  // Calculate central node size based on text
  const centralTextWidth = getTextWidth(data.central, 16)
  const centralRadius = Math.max(80, Math.min(140, centralTextWidth / 2 + 40))
  const centralMaxWidth = centralRadius * 1.4 // Reduced multiplier for better fit
  const centralLines = wrapText(data.central, centralMaxWidth, 16)

  const centralCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
  centralCircle.setAttribute("r", centralRadius)
  centralCircle.setAttribute("fill", "#8b5cf6")
  centralCircle.setAttribute("stroke", "#7c3aed")
  centralCircle.setAttribute("stroke-width", "4")

  const centralTextGroup = createMultiLineText(svg, centralLines, 0, 0, 16, "white", "bold")

  centralGroup.appendChild(centralCircle)
  centralGroup.appendChild(centralTextGroup)
  svg.appendChild(centralGroup)

  data.branches.forEach((branch, index) => {
    // Position branches at 120-degree intervals starting from top
    const angle = -Math.PI / 2 + (2 * Math.PI * index) / 3
    const branchX = centerX + Math.cos(angle) * branchRadius
    const branchY = centerY + Math.sin(angle) * branchRadius

    // Create connection line from center to branch
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
    line.setAttribute("x1", centerX + Math.cos(angle) * centralRadius)
    line.setAttribute("y1", centerY + Math.sin(angle) * centralRadius)
    line.setAttribute("x2", branchX)
    line.setAttribute("y2", branchY)
    line.setAttribute("stroke", "#8b5cf6")
    line.setAttribute("stroke-width", "3")
    line.setAttribute("marker-end", "url(#arrowhead)")
    svg.appendChild(line)

    // Calculate branch node size
    const branchTextWidth = getTextWidth(branch.name, 14)
    const branchWidth = Math.max(140, Math.min(200, branchTextWidth + 60))
    const branchMaxWidth = branchWidth - 40 // More padding
    const branchLines = wrapText(branch.name, branchMaxWidth, 14)
    const branchHeight = Math.max(60, branchLines.length * 20 + 40) // More height

    // Create branch node
    const branchGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
    branchGroup.setAttribute("class", "mind-node branch-node")
    branchGroup.setAttribute("transform", `translate(${branchX}, ${branchY})`)

    const branchRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    branchRect.setAttribute("x", -branchWidth / 2)
    branchRect.setAttribute("y", -branchHeight / 2)
    branchRect.setAttribute("width", branchWidth)
    branchRect.setAttribute("height", branchHeight)
    branchRect.setAttribute("rx", "25")
    branchRect.setAttribute("fill", "#f3f4f6")
    branchRect.setAttribute("stroke", "#8b5cf6")
    branchRect.setAttribute("stroke-width", "3")

    const branchTextGroup = createMultiLineText(svg, branchLines, 0, 0, 14, "#374151", "bold")

    branchGroup.appendChild(branchRect)
    branchGroup.appendChild(branchTextGroup)
    svg.appendChild(branchGroup)

    renderBranchChildren(branch, branchX, branchY, index)
  })

  // Add zoom and pan functionality
  setupMindMapControls()
}

function renderBranchChildren(branch, branchX, branchY, branchIndex) {
  const svg = document.getElementById("mindmapSvg")
  const childRadius = 220

  branch.children.forEach((child, childIndex) => {
    const baseAngle = (branchIndex * 2 * Math.PI) / 3 - Math.PI / 2
    const childAngle = baseAngle + (childIndex - 1) * (Math.PI / 2.5) // Adjusted for better spacing
    const childX = branchX + Math.cos(childAngle) * childRadius
    const childY = branchY + Math.sin(childAngle) * childRadius

    // Create connection line from branch to child
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
    line.setAttribute("x1", branchX)
    line.setAttribute("y1", branchY)
    line.setAttribute("x2", childX)
    line.setAttribute("y2", childY)
    line.setAttribute("stroke", "#10b981")
    line.setAttribute("stroke-width", "2")
    line.setAttribute("marker-end", "url(#childArrow)")
    line.setAttribute("class", "child-connection")
    svg.appendChild(line)

    // Calculate child node size based on text
    const childTextWidth = getTextWidth(child, 11)
    const childWidth = Math.max(140, Math.min(220, childTextWidth + 50))
    const childMaxWidth = childWidth - 30 // More padding
    const childLines = wrapText(child, childMaxWidth, 11)
    const childHeight = Math.max(50, childLines.length * 16 + 35) // More height

    // Create child node
    const childGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
    childGroup.setAttribute("class", "mind-node child-node")
    childGroup.setAttribute("transform", `translate(${childX}, ${childY})`)

    const childRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    childRect.setAttribute("x", -childWidth / 2)
    childRect.setAttribute("y", -childHeight / 2)
    childRect.setAttribute("width", childWidth)
    childRect.setAttribute("height", childHeight)
    childRect.setAttribute("rx", "15")
    childRect.setAttribute("fill", "#10b981")
    childRect.setAttribute("stroke", "#059669")
    childRect.setAttribute("stroke-width", "2")

    const childTextGroup = createMultiLineText(svg, childLines, 0, 0, 11, "white", "500")

    childGroup.appendChild(childRect)
    childGroup.appendChild(childTextGroup)
    svg.appendChild(childGroup)
  })
}

async function generateFlashcards() {
  const notes = studyNotesTextarea.value.trim()

  if (!notes) {
    showNotification("Please enter some study notes first!", "warning")
    return
  }

  // Show loading state
  generateFlashcardsBtn.disabled = true
  generateFlashcardsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...'

  try {
    console.log("[v0] Generating flashcards from notes:", notes.substring(0, 50) + "...")

    const flashcards = await callChatGPTAPI(notes)

    if (flashcards && flashcards.length > 0) {
      userFlashcards = flashcards
      currentFlashcard = 0
      updateFlashcard()
      showNotification(`Generated ${flashcards.length} flashcards successfully!`, "success")
    }
  } catch (error) {
    console.error("[v0] Error generating flashcards:", error)
    showNotification("Error generating flashcards. Please try again.", "error")
  } finally {
    // Reset button state
    generateFlashcardsBtn.disabled = false
    generateFlashcardsBtn.innerHTML = '<i class="fas fa-sparkles"></i> Generate Flashcards'
  }
}

async function callChatGPTAPI(studyNotes) {
  const prompt = `Create 5-7 flashcards from the following study notes. Return a JSON array with objects containing 'question', 'answer', 'difficulty' (easy/medium/hard), and 'subject' fields:

${studyNotes}

Format: [{"question": "...", "answer": "...", "difficulty": "medium", "subject": "..."}]`

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_CONFIG.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an educational AI that creates high-quality study flashcards. Always return valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    const flashcardsText = data.choices[0].message.content

    // Parse the JSON response
    const flashcards = JSON.parse(flashcardsText)

    // Add IDs to flashcards
    return flashcards.map((card, index) => ({
      ...card,
      id: Date.now() + index,
    }))
  } catch (error) {
    console.error("[v0] ChatGPT API Error:", error)
    // Fallback to demo flashcards if API fails
    showNotification("Using demo flashcards (API key needed for real generation)", "info")
    return flashcardsData
  }
}

// Chat functionality
function setupChat() {
  chatForm.addEventListener("submit", handleChatSubmit)
}

async function handleChatSubmit(e) {
  e.preventDefault()

  const message = chatInput.value.trim()
  if (!message) return

  console.log("[v0] Sending chat message:", message)

  // Add user message
  addChatMessage("user", message)
  chatInput.value = ""

  // Show typing indicator
  showTypingIndicator()

  try {
    const response = await getChatResponse(message)
    removeTypingIndicator()
    addChatMessage("assistant", response)
  } catch (error) {
    console.error("[v0] Chat API Error:", error)
    removeTypingIndicator()
    addChatMessage(
      "assistant",
      "I'm having trouble connecting right now. Please check your API configuration and try again.",
    )
  }
}

async function getChatResponse(userMessage) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_CONFIG.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful AI study assistant. Provide clear, educational responses to help students learn. Keep responses concise but informative.",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error("[v0] Chat API Error:", error)
    // Fallback response
    return "I'm here to help you study! Please make sure your API key is configured correctly for full functionality."
  }
}

function showTypingIndicator() {
  const typingDiv = document.createElement("div")
  typingDiv.className = "chat-message assistant typing"
  typingDiv.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>'
  typingDiv.id = "typing-indicator"

  chatMessages_div.appendChild(typingDiv)
  chatMessages_div.scrollTop = chatMessages_div.scrollHeight
}

function removeTypingIndicator() {
  const typingIndicator = document.getElementById("typing-indicator")
  if (typingIndicator) {
    typingIndicator.remove()
  }
}

// Other features setup
function setupOtherFeatures() {
  generateMindMapBtn.addEventListener("click", generateMindMap)
}

async function generateMindMap() {
  const topic = topicInput.value.trim()

  if (!topic) {
    showNotification("Please enter a topic first!", "warning")
    return
  }

  // Show loading state
  generateMindMapBtn.disabled = true
  generateMindMapBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...'

  try {
    console.log("[v0] Generating mind map for topic:", topic)

    const mindMapData = await generateMindMapData(topic)
    renderMindMap(mindMapData)
    showNotification("Mind map generated successfully!", "success")
  } catch (error) {
    console.error("[v0] Mind map generation error:", error)
    showNotification("Error generating mind map. Please try again.", "error")
  } finally {
    generateMindMapBtn.disabled = false
    generateMindMapBtn.innerHTML = '<i class="fas fa-project-diagram"></i> Generate Mind Map'
  }
}

async function generateMindMapData(topic) {
  const prompt = `Create a structured mind map for the topic "${topic}" with exactly this format:
- 1 root node: the main topic
- 3 main branches: "Introduction", "Methodology", and "Conclusion" 
- Each branch has exactly 3 detailed children describing that aspect

Return JSON format:
{
  "central": "${topic}",
  "branches": [
    {
      "name": "Introduction",
      "children": ["Detailed description 1", "Detailed description 2", "Detailed description 3"]
    },
    {
      "name": "Methodology", 
      "children": ["Detailed description 1", "Detailed description 2", "Detailed description 3"]
    },
    {
      "name": "Conclusion",
      "children": ["Detailed description 1", "Detailed description 2", "Detailed description 3"]
    }
  ]
}`

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_CONFIG.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an educational AI that creates structured mind maps with exactly 3 main branches (Introduction, Methodology, Conclusion) and 3 detailed children each. Always return valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1200,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    return JSON.parse(data.choices[0].message.content)
  } catch (error) {
    console.error("[v0] Mind map API Error:", error)
    return {
      central: topic,
      branches: [
        {
          name: "Introduction",
          children: [`Basic overview of ${topic}`, `Key concepts and definitions`, `Historical context and background`],
        },
        {
          name: "Methodology",
          children: [`Research approaches for ${topic}`, `Tools and techniques used`, `Data collection methods`],
        },
        {
          name: "Conclusion",
          children: [`Main findings about ${topic}`, `Practical applications`, `Future research directions`],
        },
      ],
    }
  }
}

function showNotification(message, type = "info") {
  // Remove existing notifications
  const existingNotification = document.querySelector(".notification")
  if (existingNotification) {
    existingNotification.remove()
  }

  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.innerHTML = `
    <i class="fas fa-${getNotificationIcon(type)}"></i>
    <span>${message}</span>
    <button class="notification-close">&times;</button>
  `

  document.body.appendChild(notification)

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove()
    }
  }, 5000)

  // Close button functionality
  notification.querySelector(".notification-close").addEventListener("click", () => {
    notification.remove()
  })
}

function getNotificationIcon(type) {
  const icons = {
    success: "check-circle",
    error: "exclamation-circle",
    warning: "exclamation-triangle",
    info: "info-circle",
  }
  return icons[type] || "info-circle"
}

function initializeFirebase() {
  // Real Firebase initialization would go here
  console.log("[v0] Firebase initialization - configure with your project settings")

  // Example Firebase initialization:
  /*
  import { initializeApp } from 'firebase/app'
  import { getFirestore } from 'firebase/firestore'
  import { getAuth } from 'firebase/auth'
  
  const app = initializeApp(API_CONFIG.FIREBASE_CONFIG)
  const db = getFirestore(app)
  const auth = getAuth(app)
  */
}

async function saveToFirebase(data) {
  console.log("[v0] Saving to Firebase:", data)

  // Real Firebase save operation:
  /*
  try {
    const docRef = await addDoc(collection(db, "flashcards"), {
      ...data,
      userId: auth.currentUser?.uid,
      createdAt: new Date()
    })
    console.log("Document written with ID: ", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error adding document: ", error)
    throw error
  }
  */
}

async function loadFromFirebase() {
  console.log("[v0] Loading from Firebase")

  // Real Firebase load operation:
  /*
  try {
    const querySnapshot = await getDocs(collection(db, "flashcards"))
    const flashcards = []
    querySnapshot.forEach((doc) => {
      flashcards.push({ id: doc.id, ...doc.data() })
    })
    return flashcards
  } catch (error) {
    console.error("Error loading documents: ", error)
    throw error
  }
  */
}

function startStudySession() {
  studySession = {
    correct: 0,
    incorrect: 0,
    startTime: new Date(),
    currentStreak: 0,
  }
  console.log("[v0] Study session started")
}

function markAnswer(isCorrect) {
  if (isCorrect) {
    studySession.correct++
    studySession.currentStreak++
  } else {
    studySession.incorrect++
    studySession.currentStreak = 0
  }

  updateStudyStats()
  console.log("[v0] Answer marked:", isCorrect ? "correct" : "incorrect")
}

function updateStudyStats() {
  // Update UI with study statistics
  const total = studySession.correct + studySession.incorrect
  const accuracy = total > 0 ? Math.round((studySession.correct / total) * 100) : 0

  console.log(`[v0] Study stats - Accuracy: ${accuracy}%, Streak: ${studySession.currentStreak}`)
}

function updateDifficultyIndicator(difficulty) {
  const existingIndicator = document.querySelector(".difficulty-indicator")
  if (existingIndicator) {
    existingIndicator.remove()
  }

  const indicator = document.createElement("div")
  indicator.className = `difficulty-indicator ${difficulty}`
  indicator.innerHTML = `<i class="fas fa-circle"></i> ${difficulty.toUpperCase()}`

  document.querySelector(".flashcard-header").appendChild(indicator)
}

function handleDifficultySelection(difficulty) {
  console.log(`[v0] Difficulty selected: ${difficulty}`)

  // Mark the answer based on difficulty (easy = correct, medium/hard = partially correct)
  const isCorrect = difficulty === "easy"
  markAnswer(isCorrect)

  // Update the current flashcard's difficulty
  if (userFlashcards[currentFlashcard]) {
    userFlashcards[currentFlashcard].difficulty = difficulty
  }

  // Show feedback to user
  const messages = {
    easy: "Great! Moving to next card.",
    medium: "Good effort! Keep practicing.",
    hard: "No worries, you'll get it next time!",
  }

  showNotification(messages[difficulty], difficulty === "easy" ? "success" : "info")

  // Auto-advance to next card after a short delay
  setTimeout(() => {
    if (currentFlashcard < userFlashcards.length - 1) {
      nextCard()
    } else {
      showNotification("You've completed all flashcards! Great job!", "success")
    }
  }, 1500)
}

function setupMindMapControls() {
  const svg = document.getElementById("mindmapSvg")
  const zoomInBtn = document.getElementById("zoomIn")
  const zoomOutBtn = document.getElementById("zoomOut")
  const resetZoomBtn = document.getElementById("resetZoom")
  const fullScreenBtn = document.getElementById("fullScreen") // Added full screen button

  let currentZoom = 0.6
  let currentPanX = 0
  let currentPanY = 0

  function updateTransform() {
    svg.style.transform = `scale(${currentZoom}) translate(${currentPanX}px, ${currentPanY}px)`
  }

  updateTransform()

  zoomInBtn.addEventListener("click", () => {
    currentZoom = Math.min(currentZoom * 1.2, 3)
    updateTransform()
    console.log("[v0] Zoomed in:", currentZoom)
  })

  zoomOutBtn.addEventListener("click", () => {
    currentZoom = Math.max(currentZoom / 1.2, 0.3)
    updateTransform()
    console.log("[v0] Zoomed out:", currentZoom)
  })

  resetZoomBtn.addEventListener("click", () => {
    currentZoom = 0.6
    currentPanX = 0
    currentPanY = 0
    updateTransform()
    console.log("[v0] Reset zoom and pan")
  })

  if (fullScreenBtn) {
    fullScreenBtn.addEventListener("click", () => {
      const mindmapCanvas = document.getElementById("mindmapCanvas")
      if (!document.fullscreenElement) {
        mindmapCanvas
          .requestFullscreen()
          .then(() => {
            console.log("[v0] Entered fullscreen mode")
          })
          .catch((err) => {
            console.log("[v0] Error entering fullscreen:", err)
          })
      } else {
        document.exitFullscreen().then(() => {
          console.log("[v0] Exited fullscreen mode")
        })
      }
    })
  }

  // Add pan functionality
  let isPanning = false
  let startX, startY

  svg.addEventListener("mousedown", (e) => {
    isPanning = true
    startX = e.clientX - currentPanX
    startY = e.clientY - currentPanY
    svg.style.cursor = "grabbing"
  })

  svg.addEventListener("mousemove", (e) => {
    if (!isPanning) return
    currentPanX = e.clientX - startX
    currentPanY = e.clientY - startY
    updateTransform()
  })

  svg.addEventListener("mouseup", () => {
    isPanning = false
    svg.style.cursor = "grab"
  })
}
