import { describe, expect, it } from "vitest";
import { renderWikiMarkdown } from "../../../lib/wiki-markdown";

describe("wiki markdown links", () => {
  it("converts labelled and plain wiki links to internal links", () => {
    expect(renderWikiMarkdown("见 [[entity/express-entry|快速通道]] 和 [[concept/settlement]]。"))
      .toBe("见 [快速通道](/wiki/entity/express-entry) 和 [concept/settlement](/wiki/concept/settlement)。");
  });

  it("does not create traversal links", () => {
    expect(renderWikiMarkdown("[[../secret|不可用]]")).toBe("不可用");
  });
});
