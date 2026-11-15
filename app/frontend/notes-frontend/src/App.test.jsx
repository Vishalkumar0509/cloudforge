import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import App from "./App";
import axios from "./axios";

vi.mock("./axios", () => ({
    __esModule: true,
    default: {
        get: vi.fn(),
        post: vi.fn(),
	put: vi.fn(),
        delete: vi.fn(),
    },
}));

beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: [] });
});

afterEach(() => {
    vi.restoreAllMocks();
});

test("renders the Notes form and displays notes from the API", async () => {
    axios.get.mockResolvedValue({
        data: [
            {
                id: 1,
                title: "CloudForge test note",
                content: "Testing the Notes application.",
            },
        ],
    });

    render(<App />);

    expect(
        screen.getByRole("heading", { name: /add a new note/i })
    ).toBeInTheDocument();

    expect(
        screen.getByRole("heading", { name: /notes list/i })
    ).toBeInTheDocument();

    expect(await screen.findByText("CloudForge test note"))
        .toBeInTheDocument();

    expect(
        screen.getByText("Testing the Notes application.")
    ).toBeInTheDocument();

    expect(axios.get).toHaveBeenCalledWith("/api/notes/");
});

test("submits a new note and displays the returned note", async () => {
    axios.post.mockResolvedValue({
        data: {
            id: 2,
            title: "New CloudForge note",
            content: "Testing note creation.",
        },
    });

    render(<App />);

    fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: "  New CloudForge note  " },
    });

    fireEvent.change(screen.getByLabelText(/content/i), {
        target: { value: "  Testing note creation.  " },
    });

    fireEvent.click(
        screen.getByRole("button", { name: /add note/i })
    );

    await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith("/api/notes/", {
            title: "New CloudForge note",
            content: "Testing note creation.",
        });
    });

    expect(
        await screen.findByText("New CloudForge note")
    ).toBeInTheDocument();

    expect(
        screen.getByText("Testing note creation.")
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/title/i)).toHaveValue("");
    expect(screen.getByLabelText(/content/i)).toHaveValue("");
});

test("rejects empty fields without calling the API", async () => {
    render(<App />);

    await screen.findByText("No notes available.");

    fireEvent.click(
        screen.getByRole("button", { name: /add note/i })
    );

    expect(
        screen.getByText("Title and content are required.")
    ).toBeInTheDocument();

    expect(axios.post).not.toHaveBeenCalled();
});

test("edits an existing note", async () => {
    axios.get.mockResolvedValue({
        data: [
            {
                id: 1,
                title: "Original title",
                content: "Original content.",
            },
        ],
    });

    axios.put.mockResolvedValue({
        data: {
            id: 1,
            title: "Updated title",
            content: "Updated content.",
        },
    });

    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: "Edit" }));

    expect(screen.getByRole("heading", { name: "Edit Note" }))
        .toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/title/i), {
        target: { value: "Updated title" },
    });

    fireEvent.change(screen.getByLabelText(/content/i), {
        target: { value: "Updated content." },
    });

    fireEvent.click(screen.getByRole("button", { name: "Update Note" }));

    await waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith("/api/notes/1/", {
            title: "Updated title",
            content: "Updated content.",
        });
    });

    expect(await screen.findByText("Updated title"))
        .toBeInTheDocument();
    expect(screen.getByText("Updated content."))
        .toBeInTheDocument();
});

test("cancels editing without updating the note", async () => {
    axios.get.mockResolvedValue({
        data: [
            {
                id: 1,
                title: "Original title",
                content: "Original content.",
            },
        ],
    });

    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByRole("heading", { name: /add a new note/i }))
        .toBeInTheDocument();
    expect(axios.put).not.toHaveBeenCalled();
    expect(await screen.findByText("Original title"))
        .toBeInTheDocument();
});

test("deletes a note after confirmation", async () => {
    axios.get.mockResolvedValue({
        data: [
            {
                id: 1,
                title: "Note to delete",
                content: "This note will be removed.",
            },
        ],
    });

    axios.delete.mockResolvedValue({ status: 204 });
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<App />);

    fireEvent.click(
        await screen.findByRole("button", { name: "Delete" })
    );

    await waitFor(() => {
        expect(axios.delete).toHaveBeenCalledWith("/api/notes/1/");
    });

    await waitFor(() => {
        expect(screen.queryByText("Note to delete"))
            .not.toBeInTheDocument();
    });
});
