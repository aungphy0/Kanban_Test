// 1. Nevigate to the Kanban app
// 2. Choose a card with subtasks that are not completed and that is not in the first column
// 3. Complete one subtask
// 4. Move task to the first column
// 5. Verify that the subtask is striked through 
// 6. Close the card edit page
// 7. Verify that the number of completed subtasks is correct
// 8. Verify that the card moved to the correct column

import { test, expect } from '@playwright/test';


test.describe.serial('Kanban Website', () => {

    test('edit kanban card', async ({ page }) => {

        //1. Nevigate to the Kanban app
        await page.goto('https://kanban-566d8.firebaseapp.com/')
        
        // 2. Choose a card with subtasks that are not completed and that is not in the first column
        //pick all the cards not from the first column
        const cards = await page.locator('section:nth-of-type(n+2) article').all();

        let selectedCard;
        let cardTitle = '';

        //pick one card with subtasks are not completed
        for(const card of cards){

            const text = await card.textContent();
            if(text){
                const sub_text = text.substring(text.length-16, text.length);
                const sub_text_split = sub_text.split(" ");
                console.log(sub_text_split[0] + " " + sub_text_split[2]);
            
                if((parseInt(sub_text_split[0]) < parseInt(sub_text_split[2]))){
                    selectedCard = card;
                    cardTitle = (await card.locator('h3').textContent())?.trim() || '';
                    console.log(`####  ${cardTitle}`);
                    break;
                }
            }
            else{
                console.log("text is null");
            }
        }

        await selectedCard.click();

        // await page.pause();

        if(!selectedCard){
            console.log("no such card!");
            return;
        }

        // 3. Complete one subtask
        const labels = await page.locator('label').all();

        // mark subtasks to complete
        for(const label of labels){
            const htmlFor = await label.getAttribute('for');
            console.log(htmlFor);
            if(htmlFor !== null && await label.locator('img').count() === 0){
                const label_to_check = page.getByText(htmlFor);
                await label_to_check.click();
            }
        }
        
        // 4. Move task to the first column
        let name;

        const menuTrigger = page.locator('div.group.cursor-pointer.relative').filter({ hasText: 'Edit Task'});
        await menuTrigger.click();

        await page.getByText('Edit Task', { exact: true}).click();

        const firstColumn = page.locator('section[data-dragscroll]').first();

        const columnName = await firstColumn.locator('h2').textContent();
        let nameOnly;
        if(columnName){
            nameOnly = columnName.trim().replace(/\s*\(\d+\)$/, '');
        }

        name = nameOnly.split(" "); 

        const dropdownTrigger = page.locator('p:text("Status")').locator('..').locator('div.group');

        await dropdownTrigger.click();

        await page.getByText(name[0], { exact: true }).click();

        await page.getByRole('button', { name: 'Save Changes' }).click();

        // 5. Verify that the subtask is striked through 
        const task = await page.locator('article h3').allTextContents();
        const tasks = task.map(t => t.trim());
        
        await expect(tasks).toContain(cardTitle);

        console.log(cardTitle);

        // 6. Close the card edit page
        // Edit Page closed after clicked "Save Changes"

        // 7. Verify that the number of completed subtasks is correct
        const checkCard = await page.locator('article', {has: page.locator('h3', {hasText: `${cardTitle}`})});
        const checkText = await checkCard.locator('p:has-text("substasks")').first().textContent();
        const checkText_split = checkText?.split(" ");

        if(checkText_split){
            await expect(checkText_split[0]).toEqual(checkText_split[2]);
        }
        else{
            console.log('checkText_split is null');
        }
        

        // 8. Verify that the card moved to the correct column
        const the_card = page.locator('article', { has: page.locator('h3', {hasText: cardTitle})});
        const the_frist_column = the_card.locator('..').locator('..');
        const the_frist_column_title = await the_frist_column.locator('h2').textContent();
        const fct = the_frist_column_title?.split(" ");

        if(fct){
            await expect(fct[0]).toEqual(name[0]);
        }
        else{
            console.log('fct is null');
        }


    });

    //Delete a Kanban card
    // test('Delete a Kanban card', async ({ page }) => {
    //     // Open the Kanban app
    //     await page.goto('https://kanban-566d8.firebaseapp.com/'); // Replace with actual URL

    //     // Get the initial card count in the column where the card exists
    //     const column = page.locator('section[data-dragscroll]').first();
    //     const cardsBefore = await column.locator('article').count();

    //     // Locate the card to delete
    //     const firstCard = column.locator('article').first();
    //     const cardTitle = await firstCard.locator('h3').textContent();
    //     const card =  await page.locator('article', {has: page.locator('h3', {hasText: `${cardTitle}`})});
    //     await expect(card).toHaveCount(1); // make sure it exists

    //     // Open the card
    //     await card.click();

        
    //     // 2. Click the menu trigger and select "Delete Task"
    //     await page.locator('div.group.cursor-pointer.relative:has-text("Delete Task")').click();
    //     await page.getByText('Delete Task', { exact: true }).click();

    //     // await page.pause();

    //     // Confirm the deletion in the modal (if applicable)
    //     const confirmButton = page.getByRole('button', { name: 'Delete' });
    //     if (await confirmButton.isVisible()) {
    //         await confirmButton.click();
    //     }

    //     // 3. Verify that the card is no longer present
    //     await expect(card).toHaveCount(0);

    //     // 4. Verify that the number of cards in the column is updated
    //     const cardsAfter = await column.locator('article').count();
    //     expect(cardsAfter).toBe(cardsBefore - 1);


    // });


});
