"use client";

import { MessageCircle, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { FooterContent } from "@/lib/cms-content";

const consultantAvatar = "/materials/20260803/资料20260803/网站右下角二维码/人像.jpg";
const wecomQr = "/materials/20260803/资料20260803/网站右下角二维码/企业微信二维码.png";

export function SiteFooter({ footer }: { footer: FooterContent }) {
  const [open, setOpen] = useState(false);

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
            <Image className="wecom-avatar" src={consultantAvatar} alt="企业顾问" width={72} height={72} />
            <strong>您的企业碳管理顾问</strong>
            <p>扫码添加企业微信</p>
            <div className="wecom-qr-wrap">
              <Image src={wecomQr} alt="峰行智成企业微信二维码" width={712} height={727} sizes="176px" />
            </div>
            <a href="mailto:service@fengxingdata.com">service@fengxingdata.com</a>
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
