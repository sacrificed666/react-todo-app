const noComments = {
  meta: {
    type: "suggestion",
    docs: { description: "Disallow comments so that code stays self-explanatory." },
    messages: { forbidden: "Comments are not allowed. Express the intent through naming and structure instead." },
    schema: [],
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          context.report({ loc: comment.loc, messageId: "forbidden" });
        }
      },
    };
  },
};

export default {
  meta: { name: "local" },
  rules: { "no-comments": noComments },
};
