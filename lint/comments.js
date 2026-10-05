const MAX_LENGTH = 80;
const DIRECTIVE =
  /^(?:eslint|oxlint|prettier|biome)\b|@ts-(?:ignore|nocheck|expect-error)\b|^(?:istanbul|c8|v8) ignore\b/u;

// One short line above a block or function; directives and prose are reported
const shortComments = {
  meta: {
    type: "suggestion",
    docs: { description: "Allow only short single-line comments that name the block or function below them." },
    messages: {
      directive: "Lint, type and coverage directives are not allowed. Fix the code instead.",
      long: "Keep a comment to one line of at most {{max}} characters. Longer explanations belong in docs/.",
      trailing: "Put the comment on its own line above the code it describes.",
    },
    schema: [],
  },
  create(context) {
    const { sourceCode } = context;
    return {
      Program() {
        let previousLine = -1;
        for (const comment of sourceCode.getAllComments()) {
          const text = comment.value.trim();
          const { start, end } = comment.loc;
          const lineStart = sourceCode.text.lastIndexOf("\n", comment.range[0] - 1) + 1;
          const before = sourceCode.text.slice(lineStart, comment.range[0]).trim();
          if (DIRECTIVE.test(text)) {
            context.report({ loc: comment.loc, messageId: "directive" });
          } else if (start.line !== end.line || start.line === previousLine + 1 || text.length > MAX_LENGTH) {
            context.report({ loc: comment.loc, messageId: "long", data: { max: String(MAX_LENGTH) } });
          } else if (before !== "" && before !== "{") {
            context.report({ loc: comment.loc, messageId: "trailing" });
          }
          previousLine = end.line;
        }
      },
    };
  },
};

export default {
  meta: { name: "local" },
  rules: { "short-comments": shortComments },
};
