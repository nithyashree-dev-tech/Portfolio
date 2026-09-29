const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <h3>M Nithya Shree</h3>
          <p>Cloud • Linux • Data • Technology</p>
        </div>
        <div className="footer-links">
          <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="mailto:nithyashree@example.com">Email</a>
        </div>
      </div>
      <div className="container footer-bottom">© {year} M Nithya Shree. All rights reserved.</div>
    </footer>
  );
};

export default Footer;
