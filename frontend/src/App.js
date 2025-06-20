"use client"

import { useState, useEffect } from "react"
import "./App.css"

function App() {
  const [resumeFile, setResumeFile] = useState(null)
  const [bulkFiles, setBulkFiles] = useState([])
  const [jobDescription, setJobDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [bulkResults, setBulkResults] = useState([])
  const [error, setError] = useState(null)
  const [currentView, setCurrentView] = useState("job-description")
  const [activeResultTab, setActiveResultTab] = useState("overall")
  const [isDragging, setIsDragging] = useState(false)
  const [recentUploads, setRecentUploads] = useState([])
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [theme, setTheme] = useState("light")
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null)
  const [viewingHistory, setViewingHistory] = useState(false)
  const [showModeSelector, setShowModeSelector] = useState(true)
  const [evaluationMode, setEvaluationMode] = useState(null) // 'student' or 'hr'
  const [extractedSkills, setExtractedSkills] = useState([])
  const [evaluationStartTime, setEvaluationStartTime] = useState(null)
  const [evaluationEndTime, setEvaluationEndTime] = useState(null)
  const [estimatedTime, setEstimatedTime] = useState(0)

  const API_BASE_URL = "https://web-production-dbb1.up.railway.app"

  const defaultJobDescription = `Software Engineer Position

Required Skills:
- Strong programming skills in Python, JavaScript, and Java
- Experience with web development frameworks (React, Node.js)
- Knowledge of database systems (SQL, MongoDB)
- Understanding of software development best practices
- Experience with version control (Git)

Qualifications:
- Bachelor's degree in Computer Science or related field
- 3+ years of professional experience
- Strong problem-solving abilities
- Excellent communication skills

Responsibilities:
- Develop and maintain web applications
- Write clean, maintainable, and efficient code
- Collaborate with cross-functional teams
- Participate in code reviews
- Implement new features and fix bugs

Nice to Have:
- Experience with cloud platforms (AWS, Azure, GCP)
- Knowledge of containerization (Docker, Kubernetes)
- Understanding of CI/CD pipelines
- Experience with Agile methodologies`

  useEffect(() => {
    // Apply theme to body
    document.body.className = theme

    // Load recent uploads from localStorage
    const savedUploads = localStorage.getItem("recentUploads")
    if (savedUploads) {
      setRecentUploads(JSON.parse(savedUploads))
    }
  }, [theme])

  const extractSkillsFromJobDescription = (description) => {
    return []
  }

  useEffect(() => {
    if (evaluationMode === "student" && jobDescription.trim()) {
      setExtractedSkills([])
    }
  }, [jobDescription, evaluationMode])

  const handleModeSelection = (mode) => {
    setEvaluationMode(mode)
    setShowModeSelector(false)
    displayNotification(`${mode === "student" ? "Student" : "HR"} mode selected`)
  }

  const resetToModeSelector = () => {
    setShowModeSelector(true)
    setEvaluationMode(null)
    setCurrentView("job-description")
    setResult(null)
    setBulkResults([])
    setResumeFile(null)
    setBulkFiles([])
    setJobDescription("")
    setExtractedSkills([])
  }

  const handleResumeFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setResumeFile(file)
      setError(null)
      displayNotification(`File "${file.name}" selected`)
    }
  }

  const handleBulkFilesChange = (event) => {
    const files = Array.from(event.target.files)
    // Filter for only PDF and DOCX files
    const validFiles = files.filter(
      (file) =>
        file.type === "application/pdf" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    )
    setBulkFiles(validFiles)
    setError(null)
    displayNotification(`${validFiles.length} files selected for bulk processing`)
  }

  const handleDefaultJobDescription = () => {
    setJobDescription(defaultJobDescription)
    displayNotification("Default job description applied")
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)

    if (evaluationMode === "hr") {
      // HR mode - accept multiple files
      const validFiles = files.filter(
        (file) =>
          file.type === "application/pdf" ||
          file.type === "application/msword" ||
          file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      )

      if (validFiles.length > 0) {
        setBulkFiles(validFiles)
        setError(null)
        displayNotification(`${validFiles.length} files dropped successfully`)
      } else {
        setError("Please upload PDF or Word documents")
      }
    } else {
      // Student mode - single file
      if (files.length > 0) {
        const file = files[0]
        if (
          file.type === "application/pdf" ||
          file.type === "application/msword" ||
          file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          setResumeFile(file)
          setError(null)
          displayNotification(`File "${file.name}" dropped successfully`)
        } else {
          setError("Please upload a PDF or Word document")
        }
      }
    }
  }

  const displayNotification = (message) => {
    setNotificationMessage(message)
    setShowNotification(true)
    setTimeout(() => {
      setShowNotification(false)
    }, 3000)
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
    displayNotification(`Switched to ${theme === "light" ? "dark" : "light"} mode`)
  }

  const formatTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`
    } else {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}m ${remainingSeconds.toFixed(0)}s`
    }
  }

  const getEstimatedTimeText = () => {
    if (evaluationMode === "student") {
      return "Estimated time: ~2 seconds"
    } else {
      const fileCount = bulkFiles.length
      const estimatedSeconds = fileCount * 1.5
      return `Estimated time: ~${formatTime(estimatedSeconds)} (${fileCount} files)`
    }
  }

  const handleResumeSubmit = async (event) => {
    event.preventDefault()

    if (evaluationMode === "student") {
    if (!resumeFile) {
        setError("Please select a resume file first")
        return
      }
    } else if (evaluationMode === "hr") {
      if (bulkFiles.length === 0) {
        setError("Please select resume files for bulk processing")
        return
      }
    }

    if (!jobDescription.trim()) {
      setError("Please enter a job description first")
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (evaluationMode === "student") {
        // Student mode - single resume evaluation
        const formData = new FormData()
        formData.append("resume", resumeFile)
        formData.append("job_description", jobDescription)

      const response = await fetch(`${API_BASE_URL}/evaluate`, {
        method: 'POST',
        body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error processing resume')
        }

        const data = await response.json()
        setResult(data)

        // Save to recent uploads
        const newUpload = {
          id: Date.now(),
          filename: resumeFile.name,
          date: new Date().toLocaleDateString(),
          score: data.overall_score,
          skills: data.skills,
          recommendations: data.recommendations,
          mode: "student",
        }

        const updatedUploads = [newUpload, ...recentUploads.slice(0, 4)]
        setRecentUploads(updatedUploads)
        localStorage.setItem("recentUploads", JSON.stringify(updatedUploads))
      } else {
        // HR mode - bulk resume evaluation
        const formData = new FormData()
        bulkFiles.forEach((file) => {
          formData.append("resumes", file)
        })
        formData.append("job_description", jobDescription)

        const response = await fetch(`${API_BASE_URL}/evaluate-folder`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error processing bulk resumes')
        }

        const data = await response.json()
        setBulkResults(data.folder_results)

        // Save bulk results to history
        data.folder_results.forEach((result) => {
          const newUpload = {
            id: Date.now() + Math.random(),
            filename: result.filename,
            date: new Date().toLocaleDateString(),
            score: result.overall_score,
            mode: "hr",
          }

          const updatedUploads = [newUpload, ...recentUploads.slice(0, 9)]
          setRecentUploads(updatedUploads)
          localStorage.setItem("recentUploads", JSON.stringify(updatedUploads))
        })
      }
    } catch (error) {
      setError(error.message || "Error connecting to server. Please try again.")
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setResult(null)
    setBulkResults([])
    setResumeFile(null)
    setBulkFiles([])
    displayNotification("Results cleared")
  }

  const exportResults = () => {
    const dataToExport = evaluationMode === "student" ? result : bulkResults
    if (!dataToExport) return

    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`

    const link = document.createElement("a")
    link.href = jsonString
    link.download = `resume-analysis-${evaluationMode}-${new Date().toISOString().slice(0, 10)}.json`
    link.click()

    displayNotification("Results exported successfully")
  }

  const handleDeleteHistory = (id) => {
    const updatedUploads = recentUploads.filter((upload) => upload.id !== id)
    setRecentUploads(updatedUploads)
    localStorage.setItem("recentUploads", JSON.stringify(updatedUploads))
    displayNotification("Item deleted successfully")
  }

  const handleDeleteAllHistory = () => {
    setRecentUploads([])
    localStorage.removeItem("recentUploads")
    displayNotification("All history cleared")
  }

  const handleViewHistory = (historyItem) => {
    setSelectedHistoryItem(historyItem)
    setViewingHistory(true)
    setResult({
      overall_score: historyItem.score,
      skills: historyItem.skills || [],
      recommendations: historyItem.recommendations || [],
    })
  }

  const handleBackToHistory = () => {
    setViewingHistory(false)
    setSelectedHistoryItem(null)
  }

  const handleViewBulkResult = (bulkItem) => {
    setResult({
      overall_score: bulkItem.overall_score,
      skills: bulkItem.skills,
      recommendations: bulkItem.recommendations,
    })
    setActiveResultTab("overall")
  }

  if (showModeSelector) {
    return (
      <div className={`App ${theme}`}>
        <div className="mode-selector-overlay">
          <div className="mode-selector-modal">
            <div className="modal-header">
              <h2>Choose Evaluation Mode</h2>
              <p>Select the type of resume evaluation you want to perform</p>
            </div>

            <div className="mode-options">
              <div className="mode-option" onClick={() => handleModeSelection("student")}>
                <div className="mode-icon">🎓</div>
                <h3>Student Resume Evaluate</h3>
                <p>Evaluate individual student resumes against job descriptions with detailed skill matching</p>
                <ul>
                  <li>Single resume upload</li>
                  <li>Detailed skill extraction from job description</li>
                  <li>Personalized recommendations</li>
                  <li>Individual progress tracking</li>
                </ul>
              </div>

              <div className="mode-option" onClick={() => handleModeSelection("hr")}>
                <div className="mode-icon">💼</div>
                <h3>HR Resume Evaluate</h3>
                <p>Bulk evaluate multiple resumes for efficient candidate screening and comparison</p>
                <ul>
                  <li>Bulk folder upload</li>
                  <li>Batch processing</li>
                  <li>Comparative analysis</li>
                  <li>Ranking and filtering</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`App ${theme}`}>
      {showNotification && <div className="notification">{notificationMessage}</div>}

      <header className="App-header">
        <div className="logo-container">
          <div className="logo">SRC</div>
        </div>
        <div className="header-content">
        <h1>SmartResumeCheck</h1>
          <p>Your AI-powered resume evaluation system - {evaluationMode === "student" ? "Student Mode" : "HR Mode"}</p>
        </div>
        <div className="header-actions">
          <button className="mode-switch-button" onClick={resetToModeSelector}>
            Switch Mode
          </button>
          <div className="theme-toggle" onClick={toggleTheme}>
            {theme === "light" ? "🌙" : "☀️"}
          </div>
        </div>
      </header>
      
      <div className="App-container">
        <aside className="App-sidebar">
          <nav>
            <ul>
              <li className={currentView === "job-description" ? "active" : ""}>
                <button
                  onClick={() => {
                    setCurrentView("job-description")
                  }}
                >
                  <span className="icon">📝</span>
                  Job Description
                </button>
              </li>
              <li className={currentView === "resume" ? "active" : ""}>
                <button
                  onClick={() => {
                    setCurrentView("resume")
                  }}
                >
                  <span className="icon">📄</span>
                  {evaluationMode === "student" ? "Resume Upload" : "Bulk Upload"}
                </button>
              </li>
              <li className={currentView === "history" ? "active" : ""}>
                <button
                  onClick={() => {
                    setCurrentView("history")
                  }}
                >
                  <span className="icon">📊</span>
                  History
                </button>
              </li>
            </ul>
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-header">
              <p>Recent Activity</p>
              {recentUploads.length > 0 && (
                <button className="clear-all-button" onClick={handleDeleteAllHistory}>
                  Clear All
                </button>
              )}
            </div>
            <div className="recent-activity">
              {recentUploads.slice(0, 3).map((upload, index) => (
                <div key={index} className="activity-item">
                  <span className="activity-icon">{upload.mode === "student" ? "🎓" : "💼"}</span>
                  <span className="activity-text">
                    {upload.filename.substring(0, 15)}
                    {upload.filename.length > 15 ? "..." : ""}
                  </span>
                  <span className="activity-score">{upload.score}%</span>
                  <button
                    className="delete-activity-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteHistory(upload.id)
                    }}
                    aria-label="Delete item"
                  >
                    ×
                  </button>
                </div>
              ))}
              {recentUploads.length === 0 && (
                <div className="activity-item empty">
                  <span className="activity-text">No recent activity</span>
                </div>
              )}
            </div>
          </div>
        </aside>

        <main className="App-content">
          {currentView === "job-description" && (
            <div className="upload-section">
              <div className="upload-container">
                <div className="upload-box">
                  <div className="section-header">
                  <h2>Enter Job Description</h2>
                    <p className="section-description">
                      {evaluationMode === "student"
                        ? "Paste the job description to analyze resume compatibility and extract required skills"
                        : "Paste the job description for bulk resume evaluation and comparison"}
                    </p>
                  </div>
                  <div className="form-group">
                    <textarea
                      className="job-description-input"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the job description here..."
                      required
                    />
                    <div className="description-actions">
                      <button className="default-description-button" onClick={handleDefaultJobDescription}>
                        <span className="button-icon">📋</span>
                        Use Default Description
                      </button>
                      <span className="word-count">
                        {jobDescription.trim() ? jobDescription.trim().split(/\s+/).length : 0} words
                      </span>
                    </div>
                  </div>

                  {evaluationMode === "student" && extractedSkills.length > 0 && (
                    <div className="extracted-skills-section">
                      <h3>Extracted Skills from Job Description</h3>
                      <div className="extracted-skills-list">
                        {extractedSkills.map((skill, index) => (
                          <div key={index} className="extracted-skill-item">
                            <span className="skill-name">{skill.name}</span>
                            <span className="skill-required">Required</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="navigation-buttons">
                    <button 
                      className="submit-button"
                      onClick={() => setCurrentView("resume")}
                      disabled={!jobDescription.trim()}
                    >
                      Continue to {evaluationMode === "student" ? "Resume Upload" : "Bulk Upload"}
                      <span className="button-icon-right">→</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === "resume" && (
            <div className="upload-section">
              <div className="upload-container">
                <div className="upload-box">
                  <div className="section-header">
                    <h2>{evaluationMode === "student" ? "Upload Your Resume" : "Bulk Resume Upload"}</h2>
                    <p className="section-description">
                      {evaluationMode === "student"
                        ? "Upload your resume to compare against the job description"
                        : "Upload multiple resumes for bulk evaluation"}
                    </p>
                  </div>
                  <form onSubmit={handleResumeSubmit}>
                    <div className="file-input-container">
                      <div
                        className={`drop-area ${isDragging ? "dragging" : ""}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        {evaluationMode === "student" ? (
                          <>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeFileChange}
                        className="file-input"
                        id="resume-upload"
                      />
                      <label htmlFor="resume-upload" className="file-label">
                              <div className="upload-icon">{resumeFile ? "📄" : "📁"}</div>
                              <div className="upload-text">
                                {resumeFile ? (
                                  <>
                                    <span className="filename">{resumeFile.name}</span>
                                    <span className="file-size">({(resumeFile.size / 1024).toFixed(1)} KB)</span>
                                  </>
                                ) : (
                                  <>
                                    Drag & drop your resume or <span className="browse-text">browse</span>
                                  </>
                                )}
                              </div>
                              <div className="upload-formats">Supported formats: PDF, DOC, DOCX</div>
                            </label>
                          </>
                        ) : (
                          <>
                            <input
                              type="file"
                              accept=".pdf,.docx"
                              onChange={handleBulkFilesChange}
                              className="file-input"
                              id="bulk-upload"
                              multiple
                            />
                            <label htmlFor="bulk-upload" className="file-label">
                              <div className="upload-icon">{bulkFiles.length > 0 ? "📁" : "📂"}</div>
                              <div className="upload-text">
                                {bulkFiles.length > 0 ? (
                                  <>
                                    <span className="filename">{bulkFiles.length} files selected</span>
                                    <span className="file-size">
                                      ({(bulkFiles.reduce((acc, file) => acc + file.size, 0) / 1024).toFixed(1)} KB
                                      total)
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    Drag & drop multiple resumes or <span className="browse-text">browse files</span>
                                  </>
                                )}
                              </div>
                              <div className="upload-formats">Supported formats: PDF, DOCX (Multiple files)</div>
                      </label>
                          </>
                        )}
                      </div>

                      {bulkFiles.length > 0 && evaluationMode === "hr" && (
                        <div className="bulk-files-preview">
                          <h4>Selected Files ({bulkFiles.length})</h4>
                          <div className="bulk-files-list">
                            {bulkFiles.slice(0, 5).map((file, index) => (
                              <div key={index} className="bulk-file-item">
                                <span className="file-icon">📄</span>
                                <span className="file-name">{file.name}</span>
                                <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                              </div>
                            ))}
                            {bulkFiles.length > 5 && (
                              <div className="bulk-file-item more">
                                <span>... and {bulkFiles.length - 5} more files</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Show estimated time */}
                      {(resumeFile || bulkFiles.length > 0) && !loading && (
                        <div className="estimated-time">
                          <span className="time-icon">⏱️</span>
                          {getEstimatedTimeText()}
                        </div>
                      )}

                      {/* Show processing progress for bulk uploads */}
                      {loading && evaluationMode === "hr" && (
                        <div className="processing-info">
                          <div className="processing-text">
                            Processing {bulkFiles.length} resumes... This may take {formatTime(estimatedTime)}
                          </div>
                          <div className="processing-tips">
                            <p>💡 Tip: Larger folders may take longer to process</p>
                            <p>📊 Each resume takes approximately 1-2 seconds to analyze</p>
                          </div>
                        </div>
                      )}

                      <button 
                        type="submit" 
                        disabled={
                          (evaluationMode === "student" && (!resumeFile || !jobDescription.trim())) ||
                          (evaluationMode === "hr" && (bulkFiles.length === 0 || !jobDescription.trim())) ||
                          loading
                        }
                        className="submit-button"
                      >
                        {loading ? (
                          <>
                            <span className="spinner"></span>
                            {evaluationMode === "student"
                              ? "Analyzing Resume..."
                              : `Processing ${bulkFiles.length} Resumes...`}
                          </>
                        ) : (
                          <>
                            {evaluationMode === "student" ? "Evaluate Resume" : "Evaluate All Resumes"}
                            <span className="button-icon-right">✓</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                  {error && <div className="error-message">{error}</div>}
                </div>
              </div>

              {/* HR Mode Bulk Results */}
              {bulkResults.length > 0 && evaluationMode === "hr" && (
                <div className="result-container">
                  <div className="result-header">
                    <h2>Bulk Evaluation Results ({bulkResults.length} resumes)</h2>
                    <div className="result-actions">
                      <button className="action-button" onClick={exportResults}>
                        <span className="action-icon">💾</span>
                        Export All
                      </button>
                      <button className="action-button" onClick={clearResults}>
                        <span className="action-icon">🗑️</span>
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="bulk-results-table">
                    <table className="results-table">
                      <thead>
                        <tr>
                          <th>Resume</th>
                          <th>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkResults
                          .sort((a, b) => b.overall_score - a.overall_score)
                          .map((result, index) => (
                            <tr key={index}>
                              <td>
                                <div className="resume-info">
                                  <span className="resume-icon">📄</span>
                                  <span className="resume-name">{result.filename}</span>
                                </div>
                              </td>
                              <td>
                                <span
                                  className="score-badge"
                                  style={{
                                    backgroundColor: `hsl(${result.overall_score * 1.2}, 70%, 50%)`,
                                  }}
                                >
                                  {result.overall_score}%
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Student Mode Results */}
              {result && evaluationMode === "student" && (
                <div className="result-container">
                  <div className="result-header">
                  <h2>Evaluation Results</h2>
                    <div className="result-actions">
                      <button className="action-button" onClick={exportResults}>
                        <span className="action-icon">💾</span>
                        Export
                      </button>
                      <button className="action-button" onClick={clearResults}>
                        <span className="action-icon">🗑️</span>
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="result-tabs">
                    <button
                      className={`tab-button ${activeResultTab === "overall" ? "active" : ""}`}
                      onClick={() => setActiveResultTab("overall")}
                    >
                      <span className="tab-icon">📊</span>
                      Overall Score
                    </button>
                    <button
                      className={`tab-button ${activeResultTab === "skills" ? "active" : ""}`}
                      onClick={() => setActiveResultTab("skills")}
                    >
                      <span className="tab-icon">🛠️</span>
                      Skills Match
                    </button>
                    <button
                      className={`tab-button ${activeResultTab === "recommendations" ? "active" : ""}`}
                      onClick={() => setActiveResultTab("recommendations")}
                    >
                      <span className="tab-icon">💡</span>
                      Recommendations
                    </button>
                  </div>

                  <div className="result-content">
                    {activeResultTab === "overall" && (
                    <div className="result-section">
                        <h3>Overall Match Score</h3>
                        <div className="score-container">
                          <div
                            className="score-circle"
                            style={{
                              "--score-value": `${result.overall_score}%`,
                              "--score-color": `hsl(${result.overall_score * 1.2}, 70%, 50%)`,
                            }}
                          >
                            <div className="score-value">{result.overall_score}%</div>
                          </div>
                          <div className="score-description">
                            {result.overall_score >= 80 ? (
                              <p>Excellent match! Your resume aligns very well with this job description.</p>
                            ) : result.overall_score >= 60 ? (
                              <p>Good match. With some improvements, your resume could be a great fit.</p>
                            ) : (
                              <p>Your resume needs significant improvements to match this job description.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {activeResultTab === "skills" && (
                    <div className="result-section">
                        <h3>Skills Match Analysis</h3>
                      <div className="skills-list">
                        {result.skills?.length > 0 ? (
                          result.skills.map((skill, index) => (
                            <div key={index} className="skill-item">
                              <span className="skill-name">{skill.name}</span>
                                <div className="skill-bar-container">
                                  <div
                                    className="skill-bar"
                                    style={{
                                      width: `${skill.match}%`,
                                      backgroundColor: `hsl(${skill.match * 1.2}, 70%, 50%)`,
                                    }}
                                  ></div>
                                </div>
                              <span className="skill-match">{skill.match}%</span>
                            </div>
                          ))
                        ) : (
                            <p className="no-data">No skills data available.</p>
                        )}
                      </div>
                    </div>
                    )}

                    {activeResultTab === "recommendations" && (
                    <div className="result-section">
                        <h3>Improvement Recommendations</h3>
                      <ul className="recommendations-list">
                        {result.recommendations?.length > 0 ? (
                          result.recommendations.map((rec, index) => (
                              <li key={index}>
                                <span className="recommendation-icon">✓</span>
                                {rec}
                              </li>
                          ))
                        ) : (
                            <p className="no-data">No recommendations available.</p>
                        )}
                      </ul>
                    </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentView === "history" && (
            <div className="upload-section">
              <div className="upload-container">
                <div className="upload-box">
                  <div className="section-header">
                    <div className="section-header-row">
                      <h2>Upload History</h2>
                      {recentUploads.length > 0 && (
                        <button className="clear-all-button-large" onClick={handleDeleteAllHistory}>
                          Clear All History
                        </button>
                      )}
                    </div>
                    <p className="section-description">View and manage your previous resume evaluations</p>
                  </div>

                  {!viewingHistory ? (
                    <div className="history-container">
                      {recentUploads.length > 0 ? (
                        <table className="history-table">
                          <thead>
                            <tr>
                              <th>Mode</th>
                              <th>File Name</th>
                              <th>Date</th>
                              <th>Score</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentUploads.map((upload, index) => (
                              <tr key={index}>
                                <td>
                                  <span className="mode-badge">
                                    {upload.mode === "student" ? "🎓 Student" : "💼 HR"}
                                  </span>
                                </td>
                                <td>
                                  <span className="history-file-icon">📄</span>
                                  {upload.filename}
                                </td>
                                <td>{upload.date}</td>
                                <td>
                                  <span
                                    className="history-score"
                                    style={{
                                      backgroundColor: `hsl(${upload.score * 1.2}, 70%, 50%)`,
                                    }}
                                  >
                                    {upload.score}%
                                  </span>
                                </td>
                                <td className="history-actions">
                                  <button className="history-action-button" onClick={() => handleViewHistory(upload)}>
                                    View
                                  </button>
                                  <button
                                    className="history-delete-button"
                                    onClick={() => handleDeleteHistory(upload.id)}
                                    aria-label="Delete item"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="empty-history">
                          <div className="empty-icon">📊</div>
                          <p>No resume evaluations yet</p>
                          <button className="submit-button" onClick={() => setCurrentView("job-description")}>
                            Start New Evaluation
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="history-result-view">
                      <div className="history-result-header">
                        <button className="back-button" onClick={handleBackToHistory}>
                          <span className="back-icon">←</span> Back to History
                        </button>
                        <div className="history-file-info">
                          <h3>{selectedHistoryItem?.filename}</h3>
                          <p>
                            Evaluated on {selectedHistoryItem?.date} (
                            {selectedHistoryItem?.mode === "student" ? "Student Mode" : "HR Mode"})
                          </p>
                        </div>
                      </div>

                      <div className="result-tabs">
                        <button
                          className={`tab-button ${activeResultTab === "overall" ? "active" : ""}`}
                          onClick={() => setActiveResultTab("overall")}
                        >
                          <span className="tab-icon">📊</span>
                          Overall Score
                        </button>
                        <button
                          className={`tab-button ${activeResultTab === "skills" ? "active" : ""}`}
                          onClick={() => setActiveResultTab("skills")}
                        >
                          <span className="tab-icon">🛠️</span>
                          Skills Match
                        </button>
                        <button
                          className={`tab-button ${activeResultTab === "recommendations" ? "active" : ""}`}
                          onClick={() => setActiveResultTab("recommendations")}
                        >
                          <span className="tab-icon">💡</span>
                          Recommendations
                        </button>
                      </div>

                      <div className="result-content">
                        {activeResultTab === "overall" && (
                          <div className="result-section">
                            <h3>Overall Match Score</h3>
                            <div className="score-container">
                              <div
                                className="score-circle"
                                style={{
                                  "--score-value": `${result.overall_score}%`,
                                  "--score-color": `hsl(${result.overall_score * 1.2}, 70%, 50%)`,
                                }}
                              >
                                <div className="score-value">{result.overall_score}%</div>
                              </div>
                              <div className="score-description">
                                {result.overall_score >= 80 ? (
                                  <p>Excellent match! This resume aligns very well with the job description.</p>
                                ) : result.overall_score >= 60 ? (
                                  <p>Good match. With some improvements, this resume could be a great fit.</p>
                                ) : (
                                  <p>This resume needs significant improvements to match the job description.</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {activeResultTab === "skills" && (
                          <div className="result-section">
                            <h3>Skills Match Analysis</h3>
                            <div className="skills-list">
                              {result.skills?.length > 0 ? (
                                result.skills.map((skill, index) => (
                                  <div key={index} className="skill-item">
                                    <span className="skill-name">{skill.name}</span>
                                    <div className="skill-bar-container">
                                      <div
                                        className="skill-bar"
                                        style={{
                                          width: `${skill.match}%`,
                                          backgroundColor: `hsl(${skill.match * 1.2}, 70%, 50%)`,
                                        }}
                                      ></div>
                                    </div>
                                    <span className="skill-match">{skill.match}%</span>
                                  </div>
                                ))
                              ) : (
                                <p className="no-data">No skills data available.</p>
                              )}
                            </div>
                          </div>
                        )}

                        {activeResultTab === "recommendations" && (
                          <div className="result-section">
                            <h3>Improvement Recommendations</h3>
                            <ul className="recommendations-list">
                              {result.recommendations?.length > 0 ? (
                                result.recommendations.map((rec, index) => (
                                  <li key={index}>
                                    <span className="recommendation-icon">✓</span>
                                    {rec}
                                  </li>
                                ))
                              ) : (
                                <p className="no-data">No recommendations available.</p>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <footer className="App-footer">
        <div className="footer-content">
          <p>
            Made with <span className="heart">❤️</span> by{" "}
            <a href="https://www.linkedin.com/in/fawad-mughal" target="_blank" rel="noopener noreferrer">
              Fawad Mughal
            </a>
            ,{" "}
            <a href="https://www.linkedin.com/in/bilal" target="_blank" rel="noopener noreferrer">
              Bilal
            </a>
            ,{" "}
            <a href="https://www.linkedin.com/in/subhan-ali" target="_blank" rel="noopener noreferrer">
              Subhan Ali
            </a>
          </p>
          <p className="copyright">© {new Date().getFullYear()} SmartResumeCheck. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
