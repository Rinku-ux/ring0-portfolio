export default function AboutPage() {
  return (
    <div className="writeup">
      <h1 className="glitch" data-text="About">About</h1>
      <p className="mono" style={{ color: "var(--muted)", marginTop: 8, fontSize: 14 }}>
        自己紹介 / プロフィール
      </p>

      <section className="about-section hud" style={{ padding: 24, marginTop: 24 }}>
        <h2 style={{ fontSize: 18, marginTop: 0, marginBottom: 16, color: "var(--accent)" }}>
          はじめに
        </h2>
        <p style={{ lineHeight: 1.8, margin: "0 0 12px" }}>
          ポートフォリオをご覧いただきありがとうございます。<br />
          Webフロントエンドを中心に、ブラウザ上で手軽に遊べるゲームや、日常を便利にするWebツールの個人開発を行っています。
        </p>
        <p style={{ lineHeight: 1.8, margin: 0 }}>
          「アイデアを素早く形にして動かす」ことをモットーに、3D表現を取り入れたブラウザゲームから、日々の活動を記録・共有するWebアプリ、Google Apps Scriptを用いた軽量なツールまで幅広く制作しています。
        </p>
      </section>

      <section className="about-section hud" style={{ padding: 24, marginTop: 24 }}>
        <h2 style={{ fontSize: 18, marginTop: 0, marginBottom: 16, color: "var(--accent)" }}>
          主な制作ジャンル
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          <div style={{ padding: 16, border: "1px solid var(--line)", background: "rgba(0, 0, 0, 0.4)" }}>
            <h3 className="mono" style={{ color: "var(--accent)", margin: "0 0 8px", fontSize: 15 }}>
              🎮 Web Games（ゲーム）
            </h3>
            <p style={{ margin: 0, fontSize: 14, color: "var(--text)", lineHeight: 1.6 }}>
              Three.jsやCanvas、WebGL等を活用した3Dアクションやミニゲーム。インストール不要でブラウザからすぐに遊べる体験を重視して制作しています。
            </p>
          </div>
          <div style={{ padding: 16, border: "1px solid var(--line)", background: "rgba(0, 0, 0, 0.4)" }}>
            <h3 className="mono" style={{ color: "var(--accent)", margin: "0 0 8px", fontSize: 15 }}>
              🛠 Web Tools（ツール）
            </h3>
            <p style={{ margin: 0, fontSize: 14, color: "var(--text)", lineHeight: 1.6 }}>
              React / Next.js、Google Apps Scriptなどを活用した実用的なWebサービス。ランニング記録の共有アプリや作業効率化スクリプトなどを手掛けています。
            </p>
          </div>
        </div>
      </section>

      <section className="about-section hud" style={{ padding: 24, marginTop: 24 }}>
        <h2 style={{ fontSize: 18, marginTop: 0, marginBottom: 16, color: "var(--accent)" }}>
          主な使用技術 / スキル
        </h2>
        <div className="inventory-items mono">
          <span className="item">TypeScript</span>
          <span className="item">JavaScript</span>
          <span className="item">React / Next.js</span>
          <span className="item">HTML5 / CSS3</span>
          <span className="item">Three.js / WebGL</span>
          <span className="item">Google Apps Script</span>
          <span className="item">Node.js</span>
          <span className="item">Git / GitHub</span>
        </div>
      </section>
    </div>
  );
}
