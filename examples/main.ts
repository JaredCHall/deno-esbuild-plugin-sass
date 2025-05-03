import { LitElement, html } from "lit";
import { customElement } from "lit-decorators";
import style from "./style.scss";

@customElement("my-lit-app")
class MyLitApp extends LitElement {
  static override styles = [style];

  override render() {
    return html`
      <h1>Hello from Lit + Sass!</h1>
    `;
  }
}