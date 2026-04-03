"use client";

import AtlassianButton, { LinkButton } from "@atlaskit/button/new";
import Lozenge from "@atlaskit/lozenge";
import SectionMessage from "@atlaskit/section-message";
import Tag from "@atlaskit/tag";
import type { ReactNode } from "react";

export function PublicPrimaryLinkButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <LinkButton appearance="primary" href={href}>
      {children}
    </LinkButton>
  );
}

export function PublicSubtleLinkButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <LinkButton appearance="subtle" href={href}>
      {children}
    </LinkButton>
  );
}

export function PublicPrimaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <AtlassianButton appearance="primary" isDisabled={disabled} onClick={onClick}>
      {children}
    </AtlassianButton>
  );
}

export function PublicSubtleButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <AtlassianButton appearance="subtle" isDisabled={disabled} onClick={onClick}>
      {children}
    </AtlassianButton>
  );
}

export function PublicLozenge({
  appearance = "default",
  children,
  isBold,
}: {
  appearance?: "default" | "inprogress" | "moved" | "new" | "removed" | "success" | "information" | "warning";
  children: ReactNode;
  isBold?: boolean;
}) {
  return (
    <Lozenge appearance={appearance} isBold={isBold}>
      {children}
    </Lozenge>
  );
}

export function PublicTag({ text }: { text: string }) {
  return <Tag text={text} />;
}

export function PublicSectionMessage({
  appearance = "information",
  title,
  children,
}: {
  appearance?: "information" | "warning" | "error" | "success" | "discovery";
  title?: string;
  children: ReactNode;
}) {
  return (
    <SectionMessage appearance={appearance} title={title}>
      {children}
    </SectionMessage>
  );
}
