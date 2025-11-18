import React from 'react';

const socialIcons = [
  {
    href: '#',
    svg: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 5 3.657 9.127 8.438 9.876v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.261c-1.243 0-1.632.772-1.632 1.562V12h2.767l-.443 2.889h-2.324v6.987C18.343 21.127 22 17 22 12"/>
      </svg>
    ),
  },
  {
    href: '#',
    svg: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 4.557a9.93 9.93 0 01-2.825.775 4.932 4.932 0 002.163-2.724c-.951.564-2.005.974-3.127 1.195A4.916 4.916 0 0016.616 3c-2.724 0-4.93 2.206-4.93 4.93 0 .385.044.762.126 1.124A13.978 13.978 0 013.1 4.15c-.426.729-.666 1.577-.666 2.476 0 1.708.87 3.214 2.188 4.099a4.904 4.904 0 01-2.229-.616v.062c0 2.385 1.693 4.374 3.946 4.827-.413.112-.849.171-1.296.171-.318 0-.626-.03-.928-.087.627 1.956 2.444 3.377 4.6 3.417A9.868 9.868 0 012 19.54a13.94 13.94 0 007.548 2.212c9.051 0 14-7.496 14-13.986 0-.213 0-.425-.016-.636A10.025 10.025 0 0024 4.557z"/>
      </svg>
    ),
  },
  {
    href: '#',
    svg: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554V14.93c0-1.317-.027-3.016-1.846-3.016-1.848 0-2.131 1.445-2.131 2.938v5.6h-3.554V9h3.414v1.561h.048c.477-.908 1.637-1.867 3.369-1.867 3.602 0 4.267 2.371 4.267 5.455v6.303zM5.337 7.433c-1.144 0-2.071-.93-2.071-2.078C3.266 4.21 4.193 3.28 5.337 3.28c1.146 0 2.07.93 2.07 2.075 0 1.148-.924 2.078-2.07 2.078zm1.777 13.019H3.56V9h3.554v11.452z"/>
      </svg>
    ),
  },
  {
    href: '#',
    svg: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.849.07 1.366.062 2.633.333 3.608 1.308.975.975 1.246 2.242 1.308 3.608.058 1.265.07 1.645.07 4.849s-.012 3.584-.07 4.849c-.062 1.366-.333 2.633-1.308 3.608-.975.975-2.242 1.246-3.608 1.308-1.265.058-1.645.07-4.849.07s-3.584-.012-4.849-.07c-1.366-.062-2.633-.333-3.608-1.308-.975-.975-1.246-2.242-1.308-3.608C2.175 15.646 2.163 15.266 2.163 12s.012-3.584.07-4.849c.062-1.366.333-2.633 1.308-3.608.975-.975 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0 1.838c-3.143 0-3.507.012-4.737.068-1.158.052-1.785.24-2.211.416-.539.21-.928.462-1.424.958-.497.496-.748.885-.958 1.424-.176.426-.364 1.053-.416 2.211-.056 1.23-.068 1.594-.068 4.737s.012 3.507.068 4.737c.052 1.158.24 1.785.416 2.211.21.539.462.928.958 1.424.496.497.885.748 1.424.958.426.176 1.053.364 2.211.416 1.23.056 1.594.068 4.737.068s3.507-.012 4.737-.068c1.158-.052 1.785-.24 2.211-.416.539-.21.928-.462 1.424-.958.497-.496.748-.885.958-1.424.176-.426.364-1.053.416-2.211.056-1.23.068-1.594.068-4.737s-.012-3.507-.068-4.737c-.052-1.158-.24-1.785-.416-2.211-.21-.539-.462-.928-.958-1.424-.496-.497-.885-.748-1.424-.958-.426-.176-1.053-.364-2.211-.416C15.507 4.013 15.143 4.001 12 4.001zm0 2.838a5.18 5.18 0 100 10.36 5.18 5.18 0 000-10.36zm0 8.563a3.383 3.383 0 110-6.766 3.383 3.383 0 010 6.766zm6.406-8.844a1.233 1.233 0 100 2.466 1.233 1.233 0 000-2.466z"/>
      </svg>
    ),
  },
];

const Footer = () => (
  <footer className="bg-black text-gray-200 pt-8 pb-4 w-full">
    <div className="w-full px-8 mt-10 flex flex-col md:flex-row justify-between items-start">
      <div className="md:w-5/12 mb-7 md:mb-0">
        <div className="flex items-center gap-2 mb-3">
          <img src="/logo.png" alt="Reconnect Logo" className="h-10 w-10" />
          <span className="text-purple-400 text-3xl font-cursive font-bold">StuAlum</span>
        </div>
        <p className="mb-3 text-sm">
          Fostering connections, learning, and growth
          <br />
          through an AI-powered alumni-student networking platf...
        </p>
        <div className="flex gap-5 mb-2">
          {socialIcons.map((icon) => (
            <a key={icon.href} href={icon.href} className="hover:text-purple-400 transition">
              {icon.svg}
            </a>
          ))}
        </div>
      </div>
      <div className="flex flex-row gap-16 md:gap-20 justify-between w-full">
        <div>
          <div className="text-white font-bold mb-2">Company</div>
          <ul className="text-sm space-y-1">
            <li>About Us</li>
            <li>Contact</li>
            <li>Blog</li>
            <li>Careers</li>
          </ul>
        </div>
        <div>
          <div className="text-white font-bold mb-2">Platform</div>
          <ul className="text-sm space-y-1">
            <li>Mentorship</li>
            <li>Forums</li>
            <li>Events</li>
            <li>Career Guidance</li>
          </ul>
        </div>
        <div>
          <div className="text-white font-bold mb-2">Support</div>
          <ul className="text-sm space-y-1">
            <li>Help Center</li>
            <li>FAQs</li>
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
          </ul>
        </div>
      </div>
    </div>
    <hr className="border-gray-800 my-4" />
    <div className="text-xs text-gray-400 text-center pb-2">
      © 2024 AlumniConnect AI. All rights reserved.
    </div>
  </footer>
);

export default Footer;
