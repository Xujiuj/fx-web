"use client";

import { MessageCircle, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { FooterContent } from "@/lib/cms-content";
import { isRuntimeManagedImage } from "@/lib/media-url";

export function SiteFooter({ footer }: { footer: FooterContent }) {
  const [open, setOpen] = useState(false);
  const consultantAvatar = footer.wecomAvatar ?? "/materials/20260803/资料20260803/网站右下角二维码/人像.jpg";
  const wecomQr = footer.wecomQr ?? "/materials/20260803/资料20260803/网站右下角二维码/企业微信二维码.png";
  const customerServiceQr = footer.customerServiceQr;
  const customerServiceHref = footer.customerServiceHref;
  const email = footer.wecomEmail ?? "service@fengxingdata.com";

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 721px)");
    const syncDefaultState = () => setOpen(Boolean(footer.wecomOpenByDefault && desktop.matches));
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

      <aside className="wecom-consultant" aria-label="企业微信咨询">
        {open ? (
          <div className="wecom-panel">
            <button className="wecom-close" type="button" onClick={() => setOpen(false)} aria-label="收起企业微信咨询">
              <X size={17} aria-hidden="true" />
            </button>
            <Image className="wecom-avatar" src={consultantAvatar} alt="企业顾问" width={72} height={72} unoptimized={isRuntimeManagedImage(consultantAvatar)} />
            <strong>{footer.wecomTitle ?? "您的企业碳管理顾问"}</strong>
            <p>{footer.wecomDescription ?? "扫码添加企业微信"}</p>
            <div className="wecom-qr-list">
              {customerServiceQr ? (
                <div className="wecom-qr-item">
                  <span>微信扫码咨询客服</span>
                  {customerServiceHref ? (
                    <a className="wecom-qr-wrap" href={customerServiceHref} target="_blank" rel="noreferrer" aria-label="打开微信客服">
                      <Image src={customerServiceQr} alt="微信客服二维码" width={705} height={903} sizes="176px" unoptimized={isRuntimeManagedImage(customerServiceQr)} />
                    </a>
                  ) : (
                    <div className="wecom-qr-wrap">
                      <Image src={customerServiceQr} alt="微信客服二维码" width={705} height={903} sizes="176px" unoptimized={isRuntimeManagedImage(customerServiceQr)} />
                    </div>
                  )}
                </div>
              ) : null}
              <div className="wecom-qr-item">
                <span>添加企业顾问</span>
                <div className="wecom-qr-wrap">
                  <Image src={wecomQr} alt="峰行智成企业微信二维码" width={712} height={727} sizes="176px" unoptimized={isRuntimeManagedImage(wecomQr)} />
                </div>
              </div>
            </div>
            {customerServiceHref ? <a className="wecom-service-link" href={customerServiceHref} target="_blank" rel="noreferrer">打开微信客服</a> : null}
            <a className="wecom-email" href={`mailto:${email}`}>{email}</a>
          </div>
        ) : (
          <button className="wecom-open" type="button" onClick={() => setOpen(true)} aria-label="打开企业微信咨询" title="企业微信咨询">
            <MessageCircle size={24} aria-hidden="true" />
            <span>企业微信</span>
          </button>
        )}
      </aside>
    </>
  );
}
