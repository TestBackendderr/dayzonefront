import React from 'react';
import './Footer.scss';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <p>© 2024 DayZone Stalker Database</p>
        </div>
        <div className="footer-center">
          <div className="footer-navigation">
            <p className="footer-task">📄 Задачи//</p>
            <p className="footer-main">Система управления сталкерами//</p>
            <p className="footer-contacts">📄 Контакты//</p>
          </div>
        </div>
        <div className="footer-right">
          <p>Версия 1.0</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
