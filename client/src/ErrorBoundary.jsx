import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Cập nhật state để lần render tiếp theo sẽ hiển thị UI dự phòng.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Bạn cũng có thể log lỗi vào một dịch vụ báo cáo lỗi
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error: error, errorInfo: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Giao diện dự phòng khi có lỗi
      return (
        <div style={{ padding: '2rem', margin: '2rem', border: '2px dashed red', borderRadius: '8px', backgroundColor: '#fff0f0' }}>
          <h1 style={{ color: '#c00', fontSize: '24px', marginBottom: '1rem' }}>Đã có lỗi xảy ra.</h1>
          <p>Vui lòng thử tải lại trang hoặc kiểm tra Console (F12) để xem chi tiết.</p>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', backgroundColor: '#f9f9f9', padding: '1rem' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
