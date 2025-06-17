import { socialImgs } from "../../constants/index.js";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="flex flex-col justify-center text-center">
          <a href="https://emil19ro.github.io/">Visit Simple portofolio</a>
        </div>
        <div className="socials">
          {socialImgs.map((img) => (
            <a key={img.url} className="icon" href={img.url} target="_blank" rel="noreferrer">
              <img src={img.imgPath} />
            </a>
          ))}
        </div>
        <div className="flex flex-col justify-center md:items-start items-center">
          <p className="text-center md:text-end">
            &copy; {new Date().getFullYear()} Hrisca Emil (ETCode) All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;