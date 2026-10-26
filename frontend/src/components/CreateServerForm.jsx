import { useState } from "react";

import { deployServer } from "../services/api";


const initialForm = {
  game: "terraria",
  server_name: "",
  port_number: 7777,
  world_name: "world",
  world_size: 2,
  difficulty: "classic",
  valheim_modifier: "normal",
};


function CreateServerForm({ onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        name === "port_number" || name === "world_size"
          ? Number(value)
          : value,
    }));
  }


  function updateGame(event) {
    const game = event.target.value;

    setForm((current) => ({
      ...current,
      game,
      difficulty:
        game === "terraria"
          ? "classic"
          : game === "minecraft"
            ? "normal"
            : "normal",
      world_size:
        game === "terraria"
          ? 2
          : undefined,
      valheim_modifier:
        game === "valheim"
          ? "normal"
          : undefined,
    }));
  }


  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.server_name) {
      setError("A server name is required.");
      return;
    }

    setLoading(true);

    try {
      const result = await deployServer({
        ...form,
        action: "deploy",
      });

      setSuccess("Server deployed successfully.");

      onCreated({
        ...form,
        ...result,
        status: "running",
      });

      setForm(initialForm);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }


  return (
    <form className="form-panel" onSubmit={handleSubmit}>
      <div className="panel-header">
        <div>
          <h3>Create a server</h3>
          <p>Step 1 of 2</p>
        </div>
      </div>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {success && (
        <p className="loading">
          {success}
        </p>
      )}

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="server_name">
            Server name
          </label>

          <input
            id="server_name"
            name="server_name"
            value={form.server_name}
            onChange={updateField}
            placeholder="terraria-01"
            pattern="[a-zA-Z0-9_-]+"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="game">
            Game
          </label>

          <select
            id="game"
            name="game"
            value={form.game}
            onChange={updateGame}
          >
            <option value="minecraft">Minecraft</option>
            <option value="terraria">Terraria</option>
            <option value="valheim">Valheim</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="port_number">
            Port
          </label>

          <input
            id="port_number"
            name="port_number"
            type="number"
            min="1024"
            max="65535"
            value={form.port_number}
            onChange={updateField}
            required
          />
        </div>

        {form.game === "terraria" && (
          <div className="form-group">
            <label htmlFor="world_size">
              World size
            </label>

            <select
              id="world_size"
              name="world_size"
              value={form.world_size}
              onChange={updateField}
            >
              <option value="1">Small</option>
              <option value="2">Medium</option>
              <option value="3">Large</option>
            </select>
          </div>
        )}

        {form.game === "terraria" && (
          <div className="form-group">
            <label htmlFor="difficulty">
              Terraria difficulty
            </label>

            <select
              id="difficulty"
              name="difficulty"
              value={form.difficulty}
              onChange={updateField}
            >
              <option value="classic">Classic</option>
              <option value="expert">Expert</option>
              <option value="master">Master</option>
              <option value="journey">Journey</option>
            </select>
          </div>
        )}

        {form.game === "minecraft" && (
          <div className="form-group">
            <label htmlFor="difficulty">
              Minecraft difficulty
            </label>

            <select
              id="difficulty"
              name="difficulty"
              value={form.difficulty}
              onChange={updateField}
            >
              <option value="peaceful">Peaceful</option>
              <option value="easy">Easy</option>
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        )}

        {form.game === "valheim" && (
          <div className="form-group">
            <label htmlFor="valheim_modifier">
              Valheim world modifier
            </label>

            <select
              id="valheim_modifier"
              name="valheim_modifier"
              value={form.valheim_modifier}
              onChange={updateField}
            >
              <option value="normal">Normal</option>
              <option value="casual">Casual</option>
              <option value="easy">Easy</option>
              <option value="hard">Hard</option>
              <option value="hardcore">Hardcore</option>
              <option value="immersive">Immersive</option>
              <option value="hammer">Hammer</option>
            </select>
          </div>
        )}

        {(form.game === "terraria" ||
          form.game === "minecraft") && (
          <div className="form-group">
            <label htmlFor="world_name">
              World name
            </label>

            <input
              id="world_name"
              name="world_name"
              value={form.world_name}
              onChange={updateField}
            />
          </div>
        )}
      </div>

      <div className="form-actions">
        <button
          className="primary-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Deploying..." : "Continue to configuration"}
        </button>
      </div>
    </form>
  );
}


export default CreateServerForm;
