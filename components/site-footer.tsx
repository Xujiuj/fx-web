"use client";

import { MessageCircle, UserRoundPlus, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { FooterContent } from "@/lib/cms-content";
import { isRuntimeManagedImage } from "@/lib/media-url";

export function SiteFooter({ footer }: { footer: FooterContent }) {
  const [activePanel, setActivePanel] = useState<"wecom" | "service" | null>(null);
  const consultantAvatar = footer.wecomAvatar ?? "/materials/20260803/资料20260803/网站右下角二维码/人像.jpg";
  const wecomQr = footer.wecomQr ?? "/materials/20260803/资料20260803/网站右下角二维码/企业微信二维码.png";
  const customerServiceQr = footer.customerServiceQr;
  const customerServiceHref = footer.customerServiceHref;
  const email = footer.wecomEmail ?? "service@fengxingdata.com";

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 721px)");
    const syncDefaultState = () => setActivePanel(footer.wecomOpenByDefault && desktop.matches ? "wecom" : null);
    const frame = window.requestAnimationFrame(syncDefaultState);
    desktop.addEventListener("change", syncDefaultState);
    return () => {
      window.cancelAnimationFrame(frame);
      desktop.removeEventListener("change", syncDefaultState);
    };
  }, [footer.wecomOpenByDefault]);

  return (
    <>
      <footer className="site-footer">
        <span>{footer.copyright}</span>
        <a href={footer.icpHref}>{footer.icpText}</a>
        <span>{footer.ipv6Text}</span>
      </footer>

      <aside className="wecom-consultant" aria-label="咨询方式">
        {activePanel ? (
          <div className={`wecom-panel${activePanel === "service" ? " is-service" : ""}`} id="consultation-panel" role="dialog" aria-label={activePanel === "service" ? "微信客服咨询" : "企业微信咨询"}>
            <button className="wecom-close" type="button" onClick={() => setActivePanel(null)} aria-label="收起咨询二维码">
              <X size={17} aria-hidden="true" />
            </button>
            {activePanel === "wecom" ? (
              <Image className="wecom-avatar" src={consultantAvatar} alt="企业顾问" width={72} height={72} unoptimized={isRuntimeManagedImage(consultantAvatar)} />
            ) : (
              <span className="wecom-panel-icon" aria-hidden="true"><MessageCircle size={26} /></span>
            )}
            <strong>{activePanel === "service" ? "微信客服咨询" : footer.wecomTitle ?? "您的企业碳管理顾问"}</strong>
            <p>{activePanel === "service" ? "微信扫码咨询客服" : footer.wecomDescription ?? "扫码添加企业微信"}</p>
            <div className="wecom-qr-list">
              {activePanel === "service" && customerServiceQr ? (
                <div className="wecom-qr-item">
                  <div className="wecom-qr-wrap wecom-qr-wrap--service">
                    <Image src={customerServiceQr} alt="微信客服二维码" width={705} height={903} sizes="176px" unoptimized={isRuntimeManagedImage(customerServiceQr)} />
                  </div>
                </div>
              ) : (
                <div className="wecom-qr-item">
                  <div className="wecom-qr-wrap">
                    <Image src={wecomQr} alt="峰行智成企业微信二维码" width={712} height={727} sizes="176px" unoptimized={isRuntimeManagedImage(wecomQr)} />
                  </div>
                </div>
              )}
            </div>
            {activePanel === "service" && customerServiceHref ? <a className="wecom-service-link" href={customerServiceHref} target="_blank" rel="noreferrer">打开微信客服</a> : null}
            {activePanel === "wecom" ? <a className="wecom-email" href={`mailto:${email}`}>{email}</a> : null}
          </div>
        ) : null}
        <div className="wecom-actions">
          <button className={`wecom-open${activePanel === "wecom" ? " is-active" : ""}`} type="button" onClick={() => setActivePanel(activePanel === "wecom" ? null : "wecom")} aria-label={activePanel === "wecom" ? "收起企业微信二维码" : "打开企业微信二维码"} aria-controls="consultation-panel" aria-expanded={activePanel === "wecom"} title="企业微信">
            <UserRoundPlus size={23} aria-hidden="true" />
            <span>企业微信</span>
          </button>
          {customerServiceQr ? (
            <button className={`wecom-open wecom-open--service${activePanel === "service" ? " is-active" : ""}`} type="button" onClick={() => setActivePanel(activePanel === "service" ? null : "service")} aria-label={activePanel === "service" ? "收起客服咨询二维码" : "打开客服咨询二维码"} aria-controls="consultation-panel" aria-expanded={activePanel === "service"} title="客服咨询">
              <MessageCircle size={23} aria-hidden="true" />
              <span>客服咨询</span>
            </button>
          ) : customerServiceHref ? (
            <a className="wecom-open wecom-open--service" href={customerServiceHref} target="_blank" rel="noreferrer" aria-label="打开微信客服" title="客服咨询">
              <MessageCircle size={23} aria-hidden="true" />
              <span>客服咨询</span>
            </a>
          ) : null}
        </div>
      </aside>
    </>
  );
}
