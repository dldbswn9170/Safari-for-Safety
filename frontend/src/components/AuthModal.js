// 로그인/회원가입 모달 (독립 모듈)
import { useState } from 'react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login'
        ? { email: formData.email, password: formData.password }
        : formData;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        // 토큰 저장
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        onLoginSuccess(data.user);
        onClose();
      } else {
        setError(data.message || '오류가 발생했습니다');
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#2a2a2a',
          padding: window.innerWidth <= 768 ? '20px' : '30px',
          borderRadius: '12px',
          width: window.innerWidth <= 768 ? '95%' : '400px',
          maxWidth: '95%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        <h2 style={{ color: '#fff', marginBottom: '20px', textAlign: 'center' }}>
          {mode === 'login' ? '로그인' : '회원가입'}
        </h2>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ color: '#ccc', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
                사용자명
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #444',
                  background: '#1a1a1a',
                  color: '#fff',
                  fontSize: '14px',
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '15px' }}>
            <label style={{ color: '#ccc', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
              이메일
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #444',
                background: '#1a1a1a',
                color: '#fff',
                fontSize: '14px',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#ccc', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
              비밀번호
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #444',
                background: '#1a1a1a',
                color: '#fff',
                fontSize: '14px',
              }}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(233, 57, 70, 0.2)',
              border: '1px solid #e63946',
              color: '#ff6b6b',
              padding: '10px',
              borderRadius: '6px',
              marginBottom: '15px',
              fontSize: '13px',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              background: '#4a90e2',
              color: '#fff',
              border: 'none',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#4a90e2',
              cursor: 'pointer',
              fontSize: '13px',
              textDecoration: 'underline',
            }}
          >
            {mode === 'login' ? '회원가입하기' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>
      </div>
    </div>
  );
}
