/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package controller;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import entity.User;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import model.HibernateUtil;
import model.Validations;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;

@WebServlet(name = "ChatSignIn", urlPatterns = {"/ChatSignIn"})
public class ChatSignIn extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        //to read content thats being sent
        Gson gson = new Gson(); //create gson lib
        //JsonObject responseJson = new JsonObject(); //create java obj

        JsonObject responseJson = new JsonObject(); //create java obj 4
        responseJson.addProperty("success", false);

        //client side eken elyt dla server side ekt hmben JSOn txt ek JsonObject kyn java obj ekt map krgnnw
        JsonObject requestJson = gson.fromJson(request.getReader(), JsonObject.class);//request eke ena   - MultipartConfig unma Json ba 
        //System.out.println(requestJson.get("message").getAsString());//ewn msg ek print kra 2
        String mobile = requestJson.get("mobile").getAsString();
        String password = requestJson.get("password").getAsString();

        if (mobile.isEmpty()) { //isBlank - whitespace denneth na - hbai old server jdk nisa use krn ba
            //mobile number is empty
            responseJson.addProperty("message", "Please fill in your Mobile Number");
        } else if (!Validations.isMobileNumberValid(mobile)) {
            //invalid mobile number
            responseJson.addProperty("message", "Invalid Mobile Number");
        } else if (password.isEmpty()) {
            //password is empty
            responseJson.addProperty("message", "Please enter your Password");
        } else if (!Validations.isPasswordValid(password)) {
            //invalid password
            responseJson.addProperty("message", "Password  must include at least one Uppsercase letter, Number, Special Character and be atleast 8 character long");
        } else {//db ekt dna wade
            
            //System.out.println("HibernateUtil");

            Session session = HibernateUtil.getSessionFactory().openSession();

            //search mobile & pw
            Criteria criteria1 = session.createCriteria(User.class);
            criteria1.add(Restrictions.eq("mobile", mobile));//menna me mobile no ekt adla users la hoynna
            criteria1.add(Restrictions.eq("password", password));

            if (!criteria1.list().isEmpty()) {

                User user = (User) criteria1.uniqueResult();

                //user found
                responseJson.addProperty("success", true);//hmbunnm true
                responseJson.addProperty("message", "User Successfully Signed-In!");
                responseJson.add("user", gson.toJsonTree(user));//user obj ek ywnwa ehapttata

            } else {
                //user not found
                responseJson.addProperty("message", "Invalid Credentials Entered!");

            }

            session.close();

        }

        response.setContentType("application/json");
        response.getWriter().write(gson.toJson(responseJson));//content sype ek set krl ek Json krl aye ywnwa

    }

}
