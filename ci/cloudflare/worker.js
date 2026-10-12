export default {
  fetch() {
    return new Response("CI worker", { status: 200 });
  },
};
