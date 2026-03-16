import { useState, useEffect } from 'react'
import './App.css'

const STORAGE_KEYS = {
  API_KEY: 'meal-planner-api-key',
  RECIPES: 'meal-planner-recipes',
  MEAL_PLAN: 'meal-planner-plan',
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEALS = ['Breakfast', 'Lunch', 'Dinner']

const CORS_PROXY = 'https://corsproxy.io/?url='

function callClaude(apiKey, messages, maxTokens = 1024) {
  return fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      messages,
    }),
  }).then(r => r.json())
}

function loadFromStorage(key, fallback) {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : fallback
  } catch {
    return fallback
  }
}

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEYS.API_KEY) || '')
  const [recipes, setRecipes] = useState(() => loadFromStorage(STORAGE_KEYS.RECIPES, []))
  const [mealPlan, setMealPlan] = useState(() => loadFromStorage(STORAGE_KEYS.MEAL_PLAN, {}))
  const [activeTab, setActiveTab] = useState('plan')
  const [urlInput, setUrlInput] = useState('')
  const [importing, setImporting] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiMessage, setAiMessage] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [newRecipe, setNewRecipe] = useState({ name: '', ingredients: '', instructions: '', servings: '' })
  const [notification, setNotification] = useState('')
  const [expandedRecipe, setExpandedRecipe] = useState(null)

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes)) }, [recipes])
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.MEAL_PLAN, JSON.stringify(mealPlan)) }, [mealPlan])
  useEffect(() => { if (apiKey) localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey) }, [apiKey])

  function notify(msg) {
    setNotification(msg)
    setTimeout(() => setNotification(''), 3500)
  }

  async function importRecipeFromUrl() {
    if (!urlInput.trim()) return
    if (!apiKey) { notify('Set your Anthropic API key first'); return }
    setImporting(true)
    try {
      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(urlInput.trim())}`
      const res = await fetch(proxyUrl)
      const html = await res.text()

      const data = await callClaude(apiKey, [{
        role: 'user',
        content: `Extract the recipe from this HTML and return ONLY valid JSON: {"name":"...","ingredients":"...","instructions":"...","servings":"..."}. No markdown, no explanation. HTML: ${html.substring(0, 8000)}`,
      }])

      const text = data.content?.[0]?.text || ''
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('Could not parse recipe from page')
      const recipe = JSON.parse(match[0])
      setRecipes(prev => [...prev, { id: Date.now(), ...recipe }])
      setUrlInput('')
      notify(`Imported: ${recipe.name}`)
      setActiveTab('recipes')
    } catch (err) {
      notify(`Import failed: ${err.message}`)
    }
    setImporting(false)
  }

  async function generateMealPlan() {
    if (!apiKey) { notify('Set your Anthropic API key first'); return }
    setAiLoading(true)
    try {
      const recipeNames = recipes.map(r => r.name).join(', ') || 'any healthy meals'
      const data = await callClaude(apiKey, [{
        role: 'user',
        content: `Create a 7-day meal plan. Available recipes: ${recipeNames}. Return ONLY valid JSON (no markdown): {"Monday":{"Breakfast":"...","Lunch":"...","Dinner":"..."},"Tuesday":{...},...} for all 7 days.`,
      }], 2048)

      const text = data.content?.[0]?.text || ''
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('Could not parse meal plan')
      setMealPlan(JSON.parse(match[0]))
      notify('Meal plan generated!')
    } catch (err) {
      notify(`Failed: ${err.message}`)
    }
    setAiLoading(false)
  }

  async function askAI() {
    if (!apiKey || !aiMessage.trim()) return
    setAiLoading(true)
    setAiResponse('')
    try {
      const data = await callClaude(apiKey, [{ role: 'user', content: aiMessage }])
      setAiResponse(data.content?.[0]?.text || '')
    } catch (err) {
      notify(`Failed: ${err.message}`)
    }
    setAiLoading(false)
  }

  function addRecipe() {
    if (!newRecipe.name.trim()) return
    setRecipes(prev => [...prev, { id: Date.now(), ...newRecipe }])
    setNewRecipe({ name: '', ingredients: '', instructions: '', servings: '' })
    notify('Recipe added!')
  }

  function deleteRecipe(id) {
    setRecipes(prev => prev.filter(r => r.id !== id))
    if (expandedRecipe === id) setExpandedRecipe(null)
  }

  function setMealSlot(day, meal, value) {
    if (!value) return
    setMealPlan(prev => ({ ...prev, [day]: { ...(prev[day] || {}), [meal]: value } }))
  }

  function clearMealSlot(day, meal) {
    setMealPlan(prev => {
      const updated = { ...prev, [day]: { ...(prev[day] || {}) } }
      delete updated[day][meal]
      return updated
    })
  }

  return (
    <div className="app">
      {notification && <div className="notification">{notification}</div>}

      <header className="app-header">
        <h1>Meal Planner</h1>
        <input
          className="api-key-input"
          type="password"
          placeholder="Anthropic API Key"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
        />
      </header>

      <nav className="tabs">
        {['plan', 'recipes', 'import', 'ai'].map(tab => (
          <button
            key={tab}
            className={`tab-btn${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'plan' && 'Weekly Plan'}
            {tab === 'recipes' && `Recipes (${recipes.length})`}
            {tab === 'import' && 'Import URL'}
            {tab === 'ai' && 'Ask AI'}
          </button>
        ))}
      </nav>

      <main className="tab-content">
        {activeTab === 'plan' && (
          <div>
            <div className="section-header">
              <h2>Weekly Meal Plan</h2>
              <button className="btn-primary" onClick={generateMealPlan} disabled={aiLoading}>
                {aiLoading ? 'Generating…' : '✨ Generate with AI'}
              </button>
            </div>
            <div className="meal-grid">
              <div className="grid-row grid-header-row">
                <div className="day-col" />
                {MEALS.map(m => <div key={m} className="meal-col-header">{m}</div>)}
              </div>
              {DAYS.map(day => (
                <div key={day} className="grid-row">
                  <div className="day-col">{day}</div>
                  {MEALS.map(meal => (
                    <div key={meal} className="meal-cell">
                      {mealPlan[day]?.[meal] ? (
                        <div className="meal-filled">
                          <span>{mealPlan[day][meal]}</span>
                          <button className="clear-btn" onClick={() => clearMealSlot(day, meal)} title="Remove">×</button>
                        </div>
                      ) : (
                        <select className="meal-select" onChange={e => setMealSlot(day, meal, e.target.value)} value="">
                          <option value="">＋ Add</option>
                          {recipes.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'recipes' && (
          <div>
            <h2>Recipes</h2>
            <div className="add-recipe-form">
              <h3>Add Recipe</h3>
              <div className="form-row">
                <input
                  placeholder="Recipe name"
                  value={newRecipe.name}
                  onChange={e => setNewRecipe(p => ({ ...p, name: e.target.value }))}
                />
                <input
                  placeholder="Servings"
                  value={newRecipe.servings}
                  onChange={e => setNewRecipe(p => ({ ...p, servings: e.target.value }))}
                />
              </div>
              <textarea
                placeholder="Ingredients (one per line)"
                value={newRecipe.ingredients}
                onChange={e => setNewRecipe(p => ({ ...p, ingredients: e.target.value }))}
                rows={3}
              />
              <textarea
                placeholder="Instructions"
                value={newRecipe.instructions}
                onChange={e => setNewRecipe(p => ({ ...p, instructions: e.target.value }))}
                rows={3}
              />
              <button className="btn-primary" onClick={addRecipe} disabled={!newRecipe.name.trim()}>
                Add Recipe
              </button>
            </div>

            {recipes.length === 0 ? (
              <p className="empty-state">No recipes yet. Add one above or import from a URL.</p>
            ) : (
              <div className="recipe-list">
                {recipes.map(r => (
                  <div key={r.id} className="recipe-card">
                    <div className="recipe-card-header">
                      <button className="recipe-title-btn" onClick={() => setExpandedRecipe(expandedRecipe === r.id ? null : r.id)}>
                        <span className="recipe-name">{r.name}</span>
                        {r.servings && <span className="servings">Serves {r.servings}</span>}
                        <span className="expand-icon">{expandedRecipe === r.id ? '▲' : '▼'}</span>
                      </button>
                      <button className="btn-danger" onClick={() => deleteRecipe(r.id)}>Delete</button>
                    </div>
                    {expandedRecipe === r.id && (
                      <div className="recipe-details">
                        {r.ingredients && (
                          <div className="recipe-section">
                            <strong>Ingredients</strong>
                            <pre>{r.ingredients}</pre>
                          </div>
                        )}
                        {r.instructions && (
                          <div className="recipe-section">
                            <strong>Instructions</strong>
                            <p>{r.instructions}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'import' && (
          <div>
            <h2>Import Recipe from URL</h2>
            <p className="hint">Paste any recipe page URL — Claude will extract the recipe automatically.</p>
            <div className="import-row">
              <input
                type="url"
                placeholder="https://www.example.com/recipe/..."
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && importRecipeFromUrl()}
              />
              <button
                className="btn-primary"
                onClick={importRecipeFromUrl}
                disabled={importing || !urlInput.trim()}
              >
                {importing ? 'Importing…' : 'Import'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div>
            <h2>Ask AI</h2>
            <p className="hint">Ask for recipe ideas, substitutions, nutrition info, or anything food-related.</p>
            <div className="ai-section">
              <textarea
                placeholder="e.g. Suggest a healthy dinner using chicken and broccoli"
                value={aiMessage}
                onChange={e => setAiMessage(e.target.value)}
                rows={4}
              />
              <button
                className="btn-primary"
                onClick={askAI}
                disabled={aiLoading || !aiMessage.trim()}
              >
                {aiLoading ? 'Thinking…' : 'Ask Claude'}
              </button>
              {aiResponse && (
                <div className="ai-response">
                  <strong>Claude says:</strong>
                  <p>{aiResponse}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
