import { useEffect } from 'react'
import { useCardStore } from './store/useCardStore'
import { FilterPanel } from './components/FilterPanel'
import { CalculatorPanel } from './components/CalculatorPanel'
import { CardList } from './components/CardList'
import { MyCardsModal } from './components/MyCardsModal'
import { AdminPanel } from './components/AdminPanel'

function App() {
  const { mode, setMode, theme, toggleTheme } = useCardStore()

  // 同步主題設定至 CSS 變數
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__brand">
            <span className="app-header__logo">💳</span>
            <div>
              <h1 className="app-header__title">信用卡回饋比較</h1>
              <p className="app-header__subtitle">依消費習慣找出最高 CP 值信用卡</p>
            </div>
          </div>

          {/* 模式切換 Tab */}
          <div className="mode-tabs">
            <button
              className={`mode-tab ${mode === 'list' ? 'mode-tab--active' : ''}`}
              onClick={() => setMode('list')}
            >
              🔍 篩選瀏覽
            </button>
            <button
              className={`mode-tab ${mode === 'calc' ? 'mode-tab--active' : ''}`}
              onClick={() => setMode('calc')}
            >
              💰 回饋試算
            </button>
            <button
              className={`mode-tab ${mode === 'admin' ? 'mode-tab--active' : ''}`}
              onClick={() => setMode('admin')}
            >
              ⚙️ 管理後台
            </button>
          </div>

          {/* 主題切換按鈕 */}
          <button
            className="btn-theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? "切換至淺色模式" : "切換至深色模式"}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {mode === 'list' ? (
          <>
            <FilterPanel />
            <CardList />
          </>
        ) : mode === 'calc' ? (
          <>
            <CalculatorPanel />
            <CardList />
          </>
        ) : (
          <AdminPanel />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>資料僅供參考，實際回饋依各銀行規定為準</p>
      </footer>

      {/* Modal */}
      <MyCardsModal />
    </div>
  )
}

export default App
