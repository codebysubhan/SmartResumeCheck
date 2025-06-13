"use client"

import { useState, useEffect } from "react"
import "./App.css"

function App() {
  const [resumeFile, setResumeFile] = useState(null)
  const [jobDescription, setJobDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
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

  const defaultJobDescription = `We are seeking a skilled Software Engineer with the following requirements:
- Strong programming skills in Python, JavaScript, and Java
- Experience with web development frameworks (React, Node.js)
- Knowledge of database systems (SQL, MongoDB)
- Understanding of software development best practices
- Excellent problem-solving and communication skills
- Bachelor's degree in Computer Science or related field
- 3+ years of professional experience`

  useEffect(() => {
    // Apply theme to body
    document.body.className = theme

    // Load recent uploads from localStorage
    const savedUploads = localStorage.getItem("recentUploads")
    if (savedUploads) {
      setRecentUploads(JSON.parse(savedUploads))
    }
  }, [theme])

  const handleResumeFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setResumeFile(file)
      setError(null)
      displayNotification(`File "${file.name}" selected`)
    }
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

    const files = e.dataTransfer.files
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

  const handleResumeSubmit = async (event) => {
    event.preventDefault()
    if (!resumeFile) {
      setError("Please select a resume file first")
      return
    }
    if (!jobDescription.trim()) {
      setError("Please enter a job description first")
      return
    }

    setLoading(true)
    setError(null)
    const formData = new FormData()
    formData.append("resume", resumeFile)
    formData.append("job_description", jobDescription)

    try {
      // Real API call to backend
      const response = await fetch('https://your-backend.up.railway.app/evaluate', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Error processing resume');
        setLoading(false);
        return;
      }
      setResult(data)

      // Save to recent uploads
      const newUpload = {
        id: Date.now(),
        filename: resumeFile.name,
        date: new Date().toLocaleDateString(),
        score: data.overall_score,
        skills: data.skills,
        recommendations: data.recommendations,
      }

      const updatedUploads = [newUpload, ...recentUploads.slice(0, 4)]
      setRecentUploads(updatedUploads)
      localStorage.setItem("recentUploads", JSON.stringify(updatedUploads))
    } catch (error) {
      setError("Error connecting to server. Please try again.")
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setResult(null)
    setResumeFile(null)
    displayNotification("Results cleared")
  }

  const exportResults = () => {
    if (!result) return

    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(result, null, 2))}`

    const link = document.createElement("a")
    link.href = jsonString
    link.download = `resume-analysis-${new Date().toISOString().slice(0, 10)}.json`
    link.click()

    displayNotification("Results exported successfully")
  }

  const handleDeleteHistory = (id) => {
    const updatedUploads = recentUploads.filter(upload => upload.id !== id)
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
      skills: historyItem.skills || [
        { name: "JavaScript", match: Math.floor(Math.random() * 30) + 70 },
        { name: "React", match: Math.floor(Math.random() * 30) + 70 },
        { name: "Node.js", match: Math.floor(Math.random() * 30) + 70 },
        { name: "Python", match: Math.floor(Math.random() * 40) + 60 },
        { name: "SQL", match: Math.floor(Math.random() * 40) + 60 },
      ],
      recommendations: historyItem.recommendations || [
        "Highlight your experience with React and Node.js more prominently",
        "Add more details about your database experience",
        "Include specific metrics and achievements from previous roles",
      ],
    })
  }

  const handleBackToHistory = () => {
    setViewingHistory(false)
    setSelectedHistoryItem(null)
  }

  return (
    <div className={`App ${theme}`}>
      <div className="theme-toggle" onClick={toggleTheme}>
        {theme === "light" ? "🌙" : "☀️"}
      </div>

      {showNotification && <div className="notification">{notificationMessage}</div>}

      <header className="App-header">
        <div className="logo-container">
          <div className="logo">SRC</div>
        </div>
        <div className="header-content">
          <h1>SmartResumeCheck</h1>
          <p>Your AI-powered resume evaluation system</p>
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
                  Resume Upload
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
                  <span className="activity-icon">📄</span>
                  <span className="activity-text">
                    {upload.filename.substring(0, 15)}
                    {upload.filename.length > 15 ? "..." : ""}
                  </span>
                  <span className="activity-score">{upload.score}%</span>
                  <button 
                    className="delete-activity-button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteHistory(upload.id);
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
                    <p className="section-description">Paste the job description to analyze resume compatibility</p>
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
                  <div className="navigation-buttons">
                    <button
                      className="submit-button"
                      onClick={() => setCurrentView("resume")}
                      disabled={!jobDescription.trim()}
                    >
                      Continue to Resume Upload
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
                    <h2>Upload Your Resume</h2>
                    <p className="section-description">Upload your resume to compare against the job description</p>
                  </div>
                  <form onSubmit={handleResumeSubmit}>
                    <div className="file-input-container">
                      <div
                        className={`drop-area ${isDragging ? "dragging" : ""}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
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
                      </div>
                      <button
                        type="submit"
                        disabled={!resumeFile || !jobDescription.trim() || loading}
                        className="submit-button"
                      >
                        {loading ? (
                          <>
                            <span className="spinner"></span>
                            Analyzing Resume...
                          </>
                        ) : (
                          <>
                            Evaluate Resume
                            <span className="button-icon-right">✓</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                  {error && <div className="error-message">{error}</div>}
                </div>
              </div>

              {result && (
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
                          <p>Evaluated on {selectedHistoryItem?.date}</p>
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
            <a href="https://www.linkedin.com/in/itssubhanali" target="_blank" rel="noopener noreferrer">
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
