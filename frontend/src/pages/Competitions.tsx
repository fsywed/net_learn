import { useState } from 'react'
import competitionsData from '../data/competitions.json'

type TabType = 'ctf' | 'certifications' | 'platforms'

export default function Competitions() {
  const [activeTab, setActiveTab] = useState<TabType>('ctf')

  const { ctf_competitions, certifications, training_platforms } = competitionsData

  return (
    <div className="competitions-page">
      <h1 className="page-title">网络安全比赛与认证</h1>
      <p className="page-subtitle">
        了解国内外顶级 CTF 赛事、权威认证考试和实战训练平台，规划你的安全学习路径。
      </p>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'ctf' ? 'active' : ''}`}
          onClick={() => setActiveTab('ctf')}
        >
          CTF 比赛
        </button>
        <button
          className={`tab ${activeTab === 'certifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('certifications')}
        >
          认证考试
        </button>
        <button
          className={`tab ${activeTab === 'platforms' ? 'active' : ''}`}
          onClick={() => setActiveTab('platforms')}
        >
          训练平台
        </button>
      </div>

      {activeTab === 'ctf' && (
        <div className="tab-content">
          <div className="section-intro">
            <h2>CTF（Capture The Flag）竞赛</h2>
            <p>
              CTF 是网络安全领域的竞技比赛，参赛者通过解决各类安全挑战获取 Flag。
              参加 CTF 可以提升实战能力、积累行业经验、拓展人脉。
            </p>
          </div>

          <div className="competition-grid">
            {ctf_competitions.map((comp) => (
              <div key={comp.id} className="competition-card">
                <div className="comp-header">
                  <h3>{comp.name}</h3>
                  <span className={`difficulty-badge ${comp.difficulty}`}>
                    {comp.difficulty === 'easy' ? '入门' : comp.difficulty === 'medium' ? '中级' : '高级'}
                  </span>
                </div>
                <p className="comp-description">{comp.description}</p>
                
                <div className="comp-info">
                  <div className="info-item">
                    <strong>级别：</strong>{comp.level}
                  </div>
                  <div className="info-item">
                    <strong>频率：</strong>{comp.frequency}
                  </div>
                  <div className="info-item">
                    <strong>形式：</strong>{comp.format}
                  </div>
                  {comp.prize && (
                    <div className="info-item">
                      <strong>奖励：</strong>{comp.prize}
                    </div>
                  )}
                  <div className="info-item">
                    <strong>团队规模：</strong>{comp.team_size}
                  </div>
                  <div className="info-item">
                    <strong>报名时间：</strong>{comp.registration}
                  </div>
                </div>

                <div className="comp-topics">
                  <strong>涉及方向：</strong>
                  <div className="topic-tags">
                    {comp.topics.map((topic, idx) => (
                      <span key={idx} className="topic-tag">{topic}</span>
                    ))}
                  </div>
                </div>

                <div className="comp-tips">
                  <strong>参赛建议：</strong>
                  <ul>
                    {comp.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>

                <a
                  href={comp.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="comp-link"
                >
                  访问官网 →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'certifications' && (
        <div className="tab-content">
          <div className="section-intro">
            <h2>信息安全认证考试</h2>
            <p>
              权威认证是证明专业能力的重要方式，也是职业发展的敲门砖。
              根据自身经验和职业规划选择合适的认证。
            </p>
          </div>

          <div className="certification-grid">
            {certifications.map((cert) => (
              <div key={cert.id} className="certification-card">
                <div className="cert-header">
                  <h3>{cert.name}</h3>
                  <span className={`level-badge ${cert.level}`}>
                    {cert.level}
                  </span>
                </div>
                <p className="cert-description">{cert.description}</p>
                
                <div className="cert-info">
                  <div className="info-item">
                    <strong>颁发机构：</strong>{cert.issuer}
                  </div>
                  <div className="info-item">
                    <strong>前置要求：</strong>{cert.prerequisites}
                  </div>
                  <div className="info-item">
                    <strong>考试形式：</strong>{cert.exam_format}
                  </div>
                  <div className="info-item">
                    <strong>考试费用：</strong>{cert.cost}
                  </div>
                  <div className="info-item">
                    <strong>有效期：</strong>{cert.validity}
                  </div>
                </div>

                <div className="cert-topics">
                  <strong>考试内容：</strong>
                  <div className="topic-list">
                    {cert.topics.map((topic, idx) => (
                      <span key={idx} className="topic-item">{topic}</span>
                    ))}
                  </div>
                </div>

                <div className="cert-preparation">
                  <strong>备考资源：</strong>
                  <ul>
                    {cert.preparation.map((resource, idx) => (
                      <li key={idx}>{resource}</li>
                    ))}
                  </ul>
                </div>

                <div className="cert-career">
                  <strong>适合岗位：</strong>{cert.career_path}
                </div>

                <a
                  href={cert.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cert-link"
                >
                  查看详情 →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'platforms' && (
        <div className="tab-content">
          <div className="section-intro">
            <h2>实战训练平台</h2>
            <p>
              纸上得来终觉浅，绝知此事要躬行。这些平台提供真实环境的练习机会，
              帮助你将理论知识转化为实战能力。
            </p>
          </div>

          <div className="platform-grid">
            {training_platforms.map((platform) => (
              <div key={platform.id} className="platform-card">
                <h3>{platform.name}</h3>
                <p className="platform-description">{platform.description}</p>
                
                <div className="platform-info">
                  <div className="info-item">
                    <strong>难度级别：</strong>{platform.level}
                  </div>
                  <div className="info-item">
                    <strong>价格：</strong>{platform.pricing}
                  </div>
                </div>

                <div className="platform-features">
                  <strong>平台特色：</strong>
                  <ul>
                    {platform.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                </div>

                <a
                  href={platform.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="platform-link"
                >
                  访问平台 →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
