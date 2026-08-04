import Link from "next/link";

import { Lockup } from "@/components/brand/Logo";

/* The site footer.
 *
 * The social marks are the brand SVGs with their fills changed to currentColor,
 * so the muted to accent hover and both themes keep working. The clip paths in
 * the source files covered the whole viewBox and did nothing, so they are
 * dropped rather than carried in and risking duplicate ids on the page.
 */

const SOCIAL = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/hellocycleplate/",
    path: (
      <>
        <path d="M384 0H128C57.3436 0 0 57.3439 0 128V384C0 454.656 57.3436 512 128 512H384C454.656 512 512 454.656 512 384V128C512 57.3439 454.656 0 384 0ZM256 384C185.344 384 128 326.656 128 256C128 185.344 185.344 128 256 128C326.656 128 384 185.344 384 256C384 326.656 326.656 384 256 384ZM392.96 143.872C378.88 143.872 367.36 132.352 367.36 118.272C367.36 104.192 378.88 92.6719 392.96 92.6719C407.04 92.6719 418.56 104.192 418.56 118.272C418.56 132.352 407.04 143.872 392.96 143.872Z" />
        <path d="M256 332.8C298.416 332.8 332.8 298.415 332.8 256C332.8 213.585 298.416 179.2 256 179.2C213.585 179.2 179.2 213.585 179.2 256C179.2 298.415 213.585 332.8 256 332.8Z" />
      </>
    ),
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@cycleplate",
    path: (
      <path d="M480.32 128.39C451.1 128.39 424.14 118.71 402.49 102.38C377.66 83.66 359.82 56.2 353.52 24.55C351.96 16.73 351.12 8.66002 351.04 0.390015H267.57V228.47L267.47 353.4C267.47 386.8 245.72 415.12 215.57 425.08C206.82 427.97 197.37 429.34 187.53 428.8C174.97 428.11 163.2 424.32 152.97 418.2C131.2 405.18 116.44 381.56 116.04 354.54C115.41 312.31 149.55 277.88 191.75 277.88C200.08 277.88 208.08 279.24 215.57 281.71V219.37V196.96C207.67 195.79 199.63 195.18 191.5 195.18C145.31 195.18 102.11 214.38 71.2301 248.97C47.8901 275.11 33.8901 308.46 31.7301 343.43C28.9001 389.37 45.7101 433.04 78.3101 465.26C83.1001 469.99 88.1301 474.38 93.3901 478.43C121.34 499.94 155.51 511.6 191.5 511.6C199.63 511.6 207.67 511 215.57 509.83C249.19 504.85 280.21 489.46 304.69 465.26C334.77 435.53 351.39 396.06 351.57 354.05L351.14 167.49C365.49 178.56 381.18 187.72 398.02 194.83C424.21 205.88 451.98 211.48 480.56 211.47V150.86V128.37C480.58 128.39 480.34 128.39 480.32 128.39Z" />
    ),
  },
  {
    name: "X",
    href: "https://x.com/cycleplate",
    path: (
      <>
        <path d="M273.121 247.258L388.34 412.062H341.054L247.033 277.582V277.573L233.229 257.832L123.397 100.727H170.683L259.317 227.517L273.121 247.258Z" />
        <path d="M456.677 0H55.3227C24.7696 0 0 24.7696 0 55.3227V456.677C0 487.23 24.7696 512 55.3227 512H456.677C487.23 512 512 487.23 512 456.677V55.3227C512 24.7696 487.23 0 456.677 0ZM326.57 434.186L231.426 295.717L112.306 434.186H81.5194L217.756 275.829L81.5194 77.5511H185.43L275.524 208.672L388.323 77.5511H419.11L289.199 228.564H289.19L430.481 434.186H326.57Z" />
      </>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/cycleplate/about/",
    path: (
      <>
        <path d="M61.5379 0.440125C27.5311 0.440125 0.00550183 28.0153 0 61.945C0 95.9078 27.5256 123.477 61.5434 123.477C95.4677 123.477 123.032 95.9078 123.032 61.945C123.032 28.0098 95.4622 0.440125 61.5379 0.440125Z" />
        <path d="M8.46191 170.149H114.576V511.56H8.46191V170.149Z" />
        <path d="M384.715 161.66C333.097 161.66 298.485 189.962 284.318 216.799H282.898V170.149H181.126H181.12V511.554H287.14V342.659C287.14 298.133 295.619 255.004 350.824 255.004C405.237 255.004 405.963 305.929 405.963 345.515V511.549H512V324.289C512 232.37 492.166 161.66 384.715 161.66Z" />
      </>
    ),
  },
] as const;

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <Lockup markSize={30} wordSize={20} />
            <p className="muted small" style={{ marginTop: 14, maxWidth: "26ch" }}>
              Cycle aligned nutrition and community for women, grounded in
              published research.
            </p>
            <div className="foot-social">
              {SOCIAL.map(({ name, href, path }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`CyclePlate on ${name}`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 512 512"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    {path}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4>Explore</h4>
            <ul>
              <li>
                <Link href="/science">The science</Link>
              </li>
              <li>
                <Link href="/community">Community</Link>
              </li>
              <li>
                <Link href="/journal">Journal</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Company</h4>
            <ul>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/about">Our mission</Link>
              </li>
              <li>
                <Link href="/partners">Partners</Link>
              </li>
              <li>
                <Link href="/#waitlist">Newsletter</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Stay in touch</h4>
            <ul>
              <li>
                <a href="mailto:hellocycleplate@gmail.com">
                  hellocycleplate@gmail.com
                </a>
              </li>
              <li>
                <a href="mailto:info@hellocycleplate.com">
                  info@hellocycleplate.com
                </a>
              </li>
              <li>
                <Link href="/#waitlist">Join the waitlist</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="foot-legal">
          <span className="mono">© 2026 CyclePlate</span>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <span>
            CyclePlate is a nutrition wellness tool. It is not medical advice,
            diagnosis, or treatment.
          </span>
        </div>
      </div>
    </footer>
  );
}
